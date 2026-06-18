<template>
	<div class="system-log-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-log-search mb15">
				<el-input v-model="state.tableData.param.admin_name" size="default" placeholder="操作人" style="max-width: 150px"></el-input>
				<el-select v-model="state.tableData.param.action" size="default" placeholder="操作类型" style="width: 140px" class="ml10" clearable>
					<el-option label="登录" value="login"></el-option>
					<el-option label="创建" value="create"></el-option>
					<el-option label="更新" value="update"></el-option>
					<el-option label="删除" value="delete"></el-option>
				</el-select>
				<el-date-picker v-model="state.tableData.param.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" class="ml10" style="width: 260px"></el-date-picker>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon><ele-Search /></el-icon>
					查询
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="admin_name" label="操作人" show-overflow-tooltip width="120"></el-table-column>
				<el-table-column prop="action" label="操作类型" show-overflow-tooltip width="100">
					<template #default="scope">
						<el-tag v-if="scope.row.action === 'login'" type="success" size="small">登录</el-tag>
						<el-tag v-else-if="scope.row.action === 'create'" type="primary" size="small">创建</el-tag>
						<el-tag v-else-if="scope.row.action === 'update'" type="warning" size="small">更新</el-tag>
						<el-tag v-else-if="scope.row.action === 'delete'" type="danger" size="small">删除</el-tag>
						<el-tag v-else type="info" size="small">{{ scope.row.action }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="target" label="操作对象" show-overflow-tooltip min-width="140"></el-table-column>
				<el-table-column prop="detail" label="详情" show-overflow-tooltip min-width="200"></el-table-column>
				<el-table-column prop="ip" label="IP" show-overflow-tooltip width="140"></el-table-column>
				<el-table-column prop="created_at" label="操作时间" show-overflow-tooltip width="160"></el-table-column>
			</el-table>
			<el-pagination
				@size-change="onHandleSizeChange"
				@current-change="onHandleCurrentChange"
				class="mt15"
				:pager-count="5"
				:page-sizes="[10, 20, 30]"
				v-model:current-page="state.tableData.param.pageNum"
				background
				v-model:page-size="state.tableData.param.pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="state.tableData.total"
			></el-pagination>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="systemLog">
import { reactive, onMounted } from 'vue';
import { useLogApi } from '/@/api/log/index';

const logApi = useLogApi();

const state = reactive({
	tableData: {
		data: [] as any[],
		total: 0,
		loading: false,
		param: {
			admin_name: '',
			action: '',
			dateRange: [] as string[],
			pageNum: 1,
			pageSize: 10,
		},
	},
});

const getTableData = async () => {
	state.tableData.loading = true;
	try {
		const params: any = { page: state.tableData.param.pageNum, pageSize: state.tableData.param.pageSize };
		if (state.tableData.param.admin_name) params.admin_name = state.tableData.param.admin_name;
		if (state.tableData.param.action) params.action = state.tableData.param.action;
		if (state.tableData.param.dateRange && state.tableData.param.dateRange.length === 2) {
			params.start_date = state.tableData.param.dateRange[0];
			params.end_date = state.tableData.param.dateRange[1];
		}
		const res = await logApi.list(params);
		if (res.code === 0 && res.data) {
			state.tableData.data = res.data.list || [];
			state.tableData.total = res.data.total || 0;
		}
	} finally { state.tableData.loading = false; }
};

const onHandleSizeChange = (val: number) => { state.tableData.param.pageSize = val; getTableData(); };
const onHandleCurrentChange = (val: number) => { state.tableData.param.pageNum = val; getTableData(); };

onMounted(() => getTableData());
</script>

<style scoped lang="scss">
.system-log-container {
	:deep(.el-card__body) { display: flex; flex-direction: column; flex: 1; overflow: auto; }
}
</style>
