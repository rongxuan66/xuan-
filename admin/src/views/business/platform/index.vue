<template>
	<div class="business-platform-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="business-platform-search mb15">
				<el-input v-model="state.tableData.param.keyword" size="default" placeholder="平台名称" style="max-width: 180px"></el-input>
				<el-select v-model="state.tableData.param.status" size="default" placeholder="状态" style="width: 120px" class="ml10" clearable>
					<el-option label="启用" :value="1"></el-option>
					<el-option label="禁用" :value="0"></el-option>
				</el-select>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon><ele-Search /></el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAdd('add')">
					<el-icon><ele-FolderAdd /></el-icon>
					新增平台
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="platform_key" label="平台标识" show-overflow-tooltip width="120"></el-table-column>
				<el-table-column prop="name" label="平台名称" show-overflow-tooltip width="120"></el-table-column>
				<el-table-column prop="icon" label="图标" show-overflow-tooltip width="70"></el-table-column>
				<el-table-column prop="color" label="主题色" show-overflow-tooltip width="100">
					<template #default="scope">
						<div style="display:flex;align-items:center;gap:6px">
							<span style="width:16px;height:16px;border-radius:4px;display:inline-block" :style="{ background: scope.row.color }"></span>
							{{ scope.row.color }}
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="sort_order" label="排序" show-overflow-tooltip width="70"></el-table-column>
				<el-table-column prop="status" label="状态" show-overflow-tooltip width="80">
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status">启用</el-tag>
						<el-tag type="info" v-else>禁用</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" show-overflow-tooltip width="160"></el-table-column>
				<el-table-column label="操作" width="130" fixed="right">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="onOpenEdit('edit', scope.row)">修改</el-button>
						<el-button size="small" text type="primary" @click="onStatusChange(scope.row)">
							{{ scope.row.status ? '禁用' : '启用' }}
						</el-button>
						<el-button size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
		<PlatformDialog ref="platformDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="businessPlatform">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { usePlatformApi } from '/@/api/platform/index';

const PlatformDialog = defineAsyncComponent(() => import('/@/views/business/platform/dialog.vue'));
const platformApi = usePlatformApi();

const platformDialogRef = ref();
const state = reactive<SysPlatformState>({
	tableData: { data: [], total: 0, loading: false, param: { keyword: '', status: null } },
});

const getTableData = async () => {
	state.tableData.loading = true;
	try {
		const res = await platformApi.list();
		if (res.code === 0 && Array.isArray(res.data)) {
			let data = res.data;
			const { keyword, status } = state.tableData.param;
			if (keyword) data = data.filter((item: RowPlatformType) => item.name.indexOf(keyword) !== -1 || item.platform_key.indexOf(keyword) !== -1);
			if (status !== null && status !== '') data = data.filter((item: RowPlatformType) => item.status === status);
			state.tableData.data = data;
			state.tableData.total = data.length;
		}
	} finally { state.tableData.loading = false; }
};

const onOpenAdd = (type: string) => platformDialogRef.value.openDialog(type);
const onOpenEdit = (type: string, row: RowPlatformType) => platformDialogRef.value.openDialog(type, row);

const onRowDel = (row: RowPlatformType) => {
	ElMessageBox.confirm(`此操作将永久删除平台："${row.name}"，是否继续?`, '提示', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
		.then(async () => {
			const res = await platformApi.remove(row.id);
			if (res.code === 0) { ElMessage.success('删除成功'); getTableData(); }
			else ElMessage.error(res.message || '删除失败');
		}).catch(() => {});
};

const onStatusChange = async (row: RowPlatformType) => {
	const newStatus = row.status ? 0 : 1;
	const res = await platformApi.update(row.id, { ...row, status: newStatus });
	if (res.code === 0) { row.status = newStatus; ElMessage.success(newStatus ? '已启用' : '已禁用'); }
	else ElMessage.error(res.message || '操作失败');
};

onMounted(() => getTableData());
</script>

<style scoped lang="scss">
.business-platform-container {
	:deep(.el-card__body) { display: flex; flex-direction: column; flex: 1; overflow: auto; .el-table { flex: 1; } }
}
</style>
