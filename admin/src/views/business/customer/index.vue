<template>
	<div class="business-customer-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="business-customer-search mb15">
				<el-input v-model="state.tableData.param.phone" size="default" placeholder="手机号" style="max-width: 160px"></el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon><ele-Search /></el-icon>
					查询
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="phone" label="手机号" show-overflow-tooltip width="140"></el-table-column>
				<el-table-column prop="nickname" label="昵称" show-overflow-tooltip width="100"></el-table-column>
				<el-table-column label="注册状态" width="90">
					<template #default="scope">
						<el-tag :type="scope.row.password ? 'success' : 'info'" size="small">{{ scope.row.password ? '已注册' : '游客' }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="total_orders" label="累计订单数" show-overflow-tooltip width="100"></el-table-column>
				<el-table-column prop="total_amount" label="累计消费金额" show-overflow-tooltip width="130">
					<template #default="scope">¥{{ Number(scope.row.total_amount).toFixed(2) }}</template>
				</el-table-column>
				<el-table-column prop="first_order_at" label="首次下单时间" show-overflow-tooltip width="160"></el-table-column>
				<el-table-column prop="last_order_at" label="最近下单时间" show-overflow-tooltip width="160"></el-table-column>
				<el-table-column label="操作" width="100">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="onViewOrders(scope.row)">查看订单</el-button>
					</template>
				</el-table-column>
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

		<el-dialog v-model="state.ordersVisible" :title="'客户订单 - ' + state.currentPhone" width="800px" destroy-on-close>
			<el-table :data="state.customerOrders" style="width:100%">
				<el-table-column prop="order_no" label="订单编号" show-overflow-tooltip width="180"></el-table-column>
				<el-table-column prop="product_title" label="商品标题" show-overflow-tooltip min-width="180"></el-table-column>
				<el-table-column prop="price" label="金额" width="90">
					<template #default="scope">¥{{ Number(scope.row.price).toFixed(2) }}</template>
				</el-table-column>
				<el-table-column prop="status" label="状态" width="90">
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status === 'paid'" size="small">已支付</el-tag>
						<el-tag type="warning" v-else-if="scope.row.status === 'pending'" size="small">待支付</el-tag>
						<el-tag type="info" v-else size="small">{{ scope.row.status }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="下单时间" width="160"></el-table-column>
			</el-table>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="businessCustomer">
import { reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useCustomerApi } from '/@/api/customer/index';

const customerApi = useCustomerApi();

const state = reactive<SysCustomerState & { ordersVisible: boolean; currentPhone: string; customerOrders: any[] }>({
	tableData: { data: [], total: 0, loading: false, param: { phone: '', pageNum: 1, pageSize: 10 } },
	ordersVisible: false,
	currentPhone: '',
	customerOrders: [],
});

const getTableData = async () => {
	state.tableData.loading = true;
	try {
		const res = await customerApi.list({
			phone: state.tableData.param.phone || undefined,
			page: state.tableData.param.pageNum,
			pageSize: state.tableData.param.pageSize,
		});
		if (res.code === 0 && res.data) {
			state.tableData.data = res.data.list || [];
			state.tableData.total = res.data.total || 0;
		}
	} finally { state.tableData.loading = false; }
};

const onViewOrders = async (row: RowCustomerType) => {
	state.currentPhone = row.phone;
	try {
		const res = await customerApi.orders(row.id);
		if (res.code === 0) {
			state.customerOrders = Array.isArray(res.data) ? res.data : [];
		}
	} catch { state.customerOrders = []; }
	state.ordersVisible = true;
};

const onHandleSizeChange = (val: number) => { state.tableData.param.pageSize = val; getTableData(); };
const onHandleCurrentChange = (val: number) => { state.tableData.param.pageNum = val; getTableData(); };

onMounted(() => getTableData());
</script>

<style scoped lang="scss">
.business-customer-container {
	:deep(.el-card__body) { display: flex; flex-direction: column; flex: 1; overflow: auto; .el-table { flex: 1; } }
}
</style>
