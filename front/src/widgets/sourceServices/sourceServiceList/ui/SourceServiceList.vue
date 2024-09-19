<script setup lang="ts">
import { PToolboxTable, PHorizontalLayout } from '@cloudforet-test/mirinae';
import { useSourceServiceListModel } from '@/widgets/sourceServices/sourceServiceList/model';
import { onBeforeMount, onMounted, watch } from 'vue';
import { showErrorMessage } from '@/shared/utils';

const {
  tableModel,
  services,
  sourceServicesStore,
  resSourceServiceList,
  initToolBoxTableModel,
} = useSourceServiceListModel();

function getSourceServiceList() {
  resSourceServiceList
    .execute()
    .then(res => {
      if (res.data.responseData) {
        //FIXME 저장하는 값에 맞게 바꿔서 setService호출해야함.
        sourceServicesStore.setService(res.data.responseData);
      }
    })
    .catch(e => {
      showErrorMessage('Error', e.errorMsg.value);
    });
}

onBeforeMount(() => {
  initToolBoxTableModel();
});

onMounted(() => {
  getSourceServiceList();
});
</script>

<template></template>

<style scoped lang="postcss"></style>
