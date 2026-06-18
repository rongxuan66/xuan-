<template>
	<div class="business-announcement-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="business-announcement-search mb15">
				<el-input v-model="state.tableData.param.keyword" size="default" placeholder="公告内容" style="max-width: 180px"></el-input>
				<el-select v-model="state.tableData.param.status" size="default" placeholder="状态" style="width: 120px" class="ml10" clearable>
					<el-option label="显示" :value="1"></el-option>
					<el-option label="隐藏" :value="0"></el-option>
				</el-select>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon><ele-Search /></el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAdd('add')">
					<el-icon><ele-FolderAdd /></el-icon>
					新增公告
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="content" label="公告内容" show-overflow-tooltip min-width="300"></el-table-column>
				<el-table-column prop="sort_order" label="排序" show-overflow-tooltip width="70"></el-table-column>
				<el-table-column prop="status" label="状态" show-overflow-tooltip width="90">
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status">显示</el-tag>
						<el-tag type="info" v-else>隐藏</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" show-overflow-tooltip width="160"></el-table-column>
				<el-table-column label="操作" width="130" fixed="right">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="onOpenEdit('edit', scope.row)">修改</el-button>
						<el-button size="small" text type="primary" @click="onStatusChange(scope.row)">
							{{ scope.row.status ? '隐藏' : '显示' }}
						</el-button>
						<el-button size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
		<AnnouncementDialog ref="announcementDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="businessAnnouncement">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useAnnouncementApi } from '/@/api/announcement/index';

const AnnouncementDialog = defineAsyncComponent(() => import('/@/views/business/announcement/dialog.vue'));
const announcementApi = useAnnouncementApi();

const announcementDialogRef = ref();
const state = reactive<SysAnnouncementState>({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: { keyword: '', status: null },
	},
});

const getTableData = async () => {
	state.tableData.loading = true;
	try {
		const res = await announcementApi.list();
		if (res.code === 0 && Array.isArray(res.data)) {
			let data = res.data;
			const { keyword, status } = state.tableData.param;
			if (keyword) data = data.filter((item: RowAnnouncementType) => item.content.indexOf(keyword) !== -1);
			if (status !== null && status !== '') data = data.filter((item: RowAnnouncementType) => item.status === status);
			state.tableData.data = data;
			state.tableData.total = data.length;
		}
	} finally {
		state.tableData.loading = false;
	}
};

const onOpenAdd = (type: string) => announcementDialogRef.value.openDialog(type);
const onOpenEdit = (type: string, row: RowAnnouncementType) => announcementDialogRef.value.openDialog(type, row);

const onRowDel = (row: RowAnnouncementType) => {
	ElMessageBox.confirm('此操作将永久删除该公告，是否继续?', '提示', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
		.then(async () => {
			try {
				const res = await announcementApi.remove(row.id);
				if (res.code === 0) { ElMessage.success('删除成功'); getTableData(); }
				else ElMessage.error(res.message || '删除失败');
			} catch { ElMessage.error('删除失败'); }
		}).catch(() => {});
};

const onStatusChange = async (row: RowAnnouncementType) => {
	const newStatus = row.status ? 0 : 1;
	try {
		const res = await announcementApi.update(row.id, { ...row, status: newStatus });
		if (res.code === 0) { row.status = newStatus; ElMessage.success(newStatus ? '已显示' : '已隐藏'); }
		else ElMessage.error(res.message || '操作失败');
	} catch { ElMessage.error('操作失败'); }
};

onMounted(() => getTableData());
</script>

<style scoped lang="scss">
.business-announcement-container {
	:deep(.el-card__body) { display: flex; flex-direction: column; flex: 1; overflow: auto; .el-table { flex: 1; } }
}
</style>
