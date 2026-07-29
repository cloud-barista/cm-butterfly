import {
  IAxiosResponse,
  RequestBodyWrapper,
  useAxiosPost,
} from '@/shared/libs';
import { IMci, MciResponseData } from '@/entities/mci/model/types';

export interface IMciRequestParams {
  nsId: string | null;
  infraId: string | null;
  option?: string | null;
}

export interface IDeleteMciParams {
  nsId: string;
  infraId: string;
  option?: string;
}

/**
 * The lifecycle actions this console offers.
 *
 * cb-tumblebug accepts more (`refine`, `reconcile`, `abort`, `continue`, `withdraw`), but those are
 * crash recovery and hold-mode gates — an operator picks them knowing the exact state the infra is
 * stuck in. Listing them beside Suspend and Reboot invites the wrong click, so they stay out.
 */
export type LifecycleAction = 'suspend' | 'resume' | 'reboot' | 'terminate';

export interface IControlMciParams {
  nsId: string;
  infraId: string;
  action: LifecycleAction;
  /**
   * Skips cb-tumblebug's two state checks: "another action is already running" and "this transition
   * is not allowed from the current status".
   *
   * ★ Not the same `force` as deletion. Deleting with force drops the CB-TB records and leaves the
   *   CSP resources running; this one touches no records and leaves nothing behind. Reusing the
   *   delete wording here would tell the user something untrue.
   */
  force?: boolean;
}

export interface IControlMciNodeParams extends IControlMciParams {
  nodeId: string;
}

/** cb-tumblebug answers control calls with a single message line (model.SimpleMsg). */
export interface IControlResult {
  message?: string;
}

function controlQueryParams(action: LifecycleAction, force?: boolean) {
  const queryParams: Record<string, string> = { action };
  // Sent only when asked for. cb-tumblebug reads it as `force == "true"`, so an absent key and
  // "false" mean the same thing, and leaving it out keeps the call as narrow as what was requested.
  if (force) queryParams.force = 'true';
  return queryParams;
}

/**
 * Control the whole infra — every node moves together.
 *
 * The response is an acknowledgement, not a completion: it comes back as "Suspending the Infra"
 * while the CSP is still working. The list Status column is what shows the transition finishing.
 */
export function useControlMci(params: IControlMciParams) {
  return useAxiosPost<IAxiosResponse<IControlResult>, any>(CONTROL_INFRA, {
    pathParams: { nsId: params.nsId, infraId: params.infraId },
    queryParams: controlQueryParams(params.action, params.force),
  });
}

/** Control a single node. Same four actions; the infra's other nodes are left alone. */
export function useControlMciNode(params: IControlMciNodeParams) {
  return useAxiosPost<IAxiosResponse<IControlResult>, any>(CONTROL_INFRA_NODE, {
    pathParams: {
      nsId: params.nsId,
      infraId: params.infraId,
      nodeId: params.nodeId,
    },
    queryParams: controlQueryParams(params.action, params.force),
  });
}

// The migration console queries infrastructure through cm-beetle rather than calling cb-tumblebug directly.
// (beetle internally calls tumblebug ReadAllInfra/ReadInfra and the response models are identical.)
// GetInfra exists on both cb-tumblebug and cm-beetle, so operationId alone collides — we use explicit subsystem routing.
const GET_ALL_MCI = 'cm-beetle/ListInfra';
const GET_MCI_INFO = 'cm-beetle/GetInfra';
const DELETE_INFRA = 'cm-beetle/DeleteInfra';
// cm-beetle tracks requests by X-Request-Id (GET /request/{reqId} → Handling|Success|Error).
// To handle long-running requests such as infra deletion asynchronously, we send reqId as a header on delete
// and poll progress with this operationId. tumblebug also has GetRequest, so the prefix is required.
const GET_BEETLE_REQUEST = 'cm-beetle/GetRequest';

// Lifecycle control belongs to cb-tumblebug, not cm-beetle.
//
// Everything else on this screen goes through cm-beetle, so control would naturally go there too —
// but cm-beetle has no such endpoint. Its infra surface is migrate / get / list / delete and nothing
// more (checked against v0.5.6 and against every cm-beetle operationId in api.yaml). cm-beetle owns
// the *migration*; running what the migration produced stayed with cb-tumblebug.
//
// Both operationIds are already registered in api.yaml, so no backend change is needed. If cm-beetle
// ever grows a control API, these two constants are the only thing that has to move.
const CONTROL_INFRA = 'cb-tumblebug/GetControlInfra';
const CONTROL_INFRA_NODE = 'cb-tumblebug/GetControlInfraNode';

export function useGetMciList(projectId: string | null, option: string | null) {
  const requestBodyWrapper: Required<
    Pick<
      RequestBodyWrapper<{ nsId: string | null } | { option: string | null }>,
      'pathParams' | 'queryParams'
    >
  > = {
    pathParams: {
      nsId: projectId,
    },
    queryParams: {
      option: option,
    },
  };

  return useAxiosPost<
    IAxiosResponse<MciResponseData>,
    Required<
      Pick<
        RequestBodyWrapper<{ nsId: string | null } | { option: string | null }>,
        'pathParams' | 'queryParams'
      >
    >
  >(GET_ALL_MCI, requestBodyWrapper);
}

export function useGetMciInfo(params: IMciRequestParams | null) {
  const requestBodyWrapper: Required<
    Pick<RequestBodyWrapper<IMciRequestParams>, 'pathParams'>
  > = {
    pathParams: {
      nsId: params?.nsId || null,
      infraId: params?.infraId || null,
    },
  };

  return useAxiosPost<
    IAxiosResponse<IMci>,
    Required<Pick<RequestBodyWrapper<IMciRequestParams>, 'pathParams'>>
  >(GET_MCI_INFO, requestBodyWrapper);
}

export function useDeleteMci(params: IDeleteMciParams, reqId?: string) {
  const requestBodyWrapper: any = {
    pathParams: {
      nsId: params.nsId,
      infraId: params.infraId,
    },
  };

  if (params.option) {
    requestBodyWrapper.queryParams = {
      option: params.option,
    };
  }

  // Sending reqId as X-Request-Id makes the backend proxy forward it as-is to cm-beetle.
  // Progress can then be polled with useGetBeetleRequest(reqId).
  const config = reqId ? { headers: { 'X-Request-Id': reqId } } : undefined;

  return useAxiosPost<IAxiosResponse<any>, any>(
    DELETE_INFRA,
    requestBodyWrapper,
    config,
  );
}

// Queries the progress of long-running requests (such as deletion) via cm-beetle request tracking.
// Response status: Handling (in progress) | Success | Error. The record persists even if we time out with 504,
// so the result can be retrieved with just the reqId after navigating away or refreshing.
export function useGetBeetleRequest(reqId: string) {
  return useAxiosPost<IAxiosResponse<any>, any>(GET_BEETLE_REQUEST, {
    pathParams: { reqId },
  });
}
