<script setup lang="ts">
import { PIconButton } from '@cloudforet-test/mirinae';
import { useDeleteVPC } from '@/entities';
import { DEFAULT_NAMESPACE } from '@/shared/constants/namespace';

const resDeleteVPC = useDeleteVPC<
  any,
  null | { nsId: string; vNetId: string | any }
>(null);

const props = defineProps({
  label: String,
  focus: Boolean,
  focusedData: Object,
});

const handleDelete = async () => {
  const { data } = await resDeleteVPC.execute({
    pathParams: {
      nsId: DEFAULT_NAMESPACE,
      vNetId: props.focusedData?.vpcName,
    },
  });

  console.log(data);
};
</script>

<template>
  <div class="tool">
    <p v-if="focus">{{ label }}</p>
    <p-icon-button
      name="ic_delete"
      @click="$emit('button-click', handleDelete())"
    />
  </div>
</template>
