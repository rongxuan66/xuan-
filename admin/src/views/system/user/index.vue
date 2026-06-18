<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.username" size="default" placeholder="管理员用户名" style="max-width: 180px"></el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon><ele-Search /></el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAdd('add')">
					<el-icon><ele-FolderAdd /></el-icon>
					新增管理员
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="username" label="用户名" show-overflow-tooltip></el-table-column>
				<el-table-column prop="nickname" label="昵称" show-overflow-tooltip></el-table-column>
				<el-table-column prop="role" label="角色" show-overflow-tooltip width="100">
					<template #default="scope">
						<el-tag type="danger" v-if="scope.row.role === 'admin'" size="small">超级管理员</el-tag>
						<el-tag type="primary" v-else size="small">{{ scope.row.role }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="状态" show-overflow-tooltip width="80">
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status">启用</el-tag>
						<el-tag type="info" v-else>禁用</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="last_login_at" label="最后登录" show-overflow-tooltip width="160">
					<template #default="scope">{{ scope.row.last_login_at || '-' }}</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" show-overflow-tooltip width="160"></el-table-column>
				<el-table-column label="操作" width="120">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="onOpenEdit('edit', scope.row)">修改</el-button>
						<el-button :disabled="scope.row.role === 'admin'" size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
		<UserDialog ref="userDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemUser">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useAdminApi } from '/@/api/admin/index';

const UserDialog = defineAsyncComponent(() => import('/@/views/system/user/dialog.vue'));
const adminApi = useAdminApi();

const userDialogRef = ref();
const state = reactive({
	tableData: {
		data: [] as any[],
		total: 0,
		loading: false,
		param: {
			username: '',
		},
	},
	allData: [] as any[],
});

const getTableData = async () => {
	state.tableData.loading = true;
	try {
		const res = await adminApi.list();
		if (res.code === 0) {
			let data = Array.isArray(res.data) ? res.data : [];
			if (state.tableData.param.username) {
				data = data.filter((item: any) => item.username.indexOf(state.tableData.param.username) !== -1);
			}
			state.tableData.data = data;
			state.tableData.total = data.length;
		}
	} finally { state.tableData.loading = false; }
};

const onOpenAdd = (type: string) => {
	userDialogRef.value.openDialog(type);
};

const onOpenEdit = (type: string, row: any) => {
	userDialogRef.value.openDialog(type, row);
};

const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除管理员："${row.username}"，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const res = await adminApi.remove(row.id);
			if (res.code === 0) { ElMessage.success('删除成功'); getTableData(); }
			else ElMessage.error(res.message || '删除失败');
		})
		.catch(() => {});
};

onMounted(() => {
	getTableData();
});
</script>

<style scoped lang="scss">
.system-user-container {
	:deep(.el-card__body) {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: auto;
		.el-table {
			flex: 1;
		}
	}
}
</style>
