<template>
	<div class="business-order-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="business-order-search mb15">
				<el-input v-model="state.tableData.param.order_no" size="default" placeholder="订单编号" style="max-width: 200px"></el-input>
				<el-input v-model="state.tableData.param.phone" size="default" placeholder="手机号" style="max-width: 160px" class="ml10"></el-input>
				<el-select v-model="state.tableData.param.status" size="default" placeholder="订单状态" style="width: 120px" class="ml10" clearable>
					<el-option label="待支付" value="pending"></el-option>
					<el-option label="已支付" value="paid"></el-option>
					<el-option label="已退款" value="refunded"></el-option>
				</el-select>
				<el-select v-model="state.tableData.param.pay_method" size="default" placeholder="支付方式" style="width: 120px" class="ml10" clearable>
					<el-option label="微信支付" value="wechat"></el-option>
					<el-option label="支付宝" value="alipay"></el-option>
					<el-option label="QQ支付" value="qq"></el-option>
				</el-select>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon><ele-Search /></el-icon>
					查询
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="order_no" label="订单编号" show-overflow-tooltip min-width="180"></el-table-column>
				<el-table-column prop="product_title" label="商品标题" show-overflow-tooltip min-width="180"></el-table-column>
				<el-table-column prop="price" label="订单金额" show-overflow-tooltip width="100">
					<template #default="scope">¥{{ Number(scope.row.price).toFixed(2) }}</template>
				</el-table-column>
				<el-table-column prop="phone" label="手机号" show-overflow-tooltip width="130"></el-table-column>
				<el-table-column prop="pay_method" label="支付方式" show-overflow-tooltip width="100">
					<template #default="scope">
						<el-tag v-if="scope.row.pay_method === 'wechat'" type="success">微信</el-tag>
						<el-tag v-else-if="scope.row.pay_method === 'alipay'" type="primary">支付宝</el-tag>
						<el-tag v-else-if="scope.row.pay_method === 'qq'" type="info">QQ</el-tag>
						<el-tag v-else type="info">-</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="订单状态" show-overflow-tooltip width="100">
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status === 'paid'">已支付</el-tag>
						<el-tag type="warning" v-else-if="scope.row.status === 'pending'">待支付</el-tag>
						<el-tag type="info" v-else-if="scope.row.status === 'refunded'">已退款</el-tag>
						<el-tag v-else>{{ scope.row.status }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="下单时间" show-overflow-tooltip width="160"></el-table-column>
				<el-table-column label="操作" width="250" fixed="right">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="onOpenEdit('edit', scope.row)">修改</el-button>
						<el-button size="small" text type="success" @click="onConfirmPayment(scope.row)" v-if="scope.row.status === 'pending'">确认收款</el-button>
						<el-button size="small" text type="primary" @click="onDeliver(scope.row)" v-if="scope.row.status === 'paid' && !scope.row.account">发货</el-button>
						<el-button size="small" text type="primary" @click="onRefund(scope.row)" v-if="scope.row.status === 'paid'">退款</el-button>
						<el-button size="small" text type="primary" @click="onExport">导出</el-button>
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
		<OrderDialog ref="orderDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="businessOrder">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useOrderApi } from '/@/api/order/index';

const OrderDialog = defineAsyncComponent(() => import('/@/views/business/order/dialog.vue'));
const orderApi = useOrderApi();

const orderDialogRef = ref();
const state = reactive<SysOrderState>({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: {
			order_no: '',
			phone: '',
			status: '',
			pay_method: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});

const getTableData = async () => {
	state.tableData.loading = true;
	try {
		const params: any = { page: state.tableData.param.pageNum, pageSize: state.tableData.param.pageSize };
		if (state.tableData.param.order_no) params.order_no = state.tableData.param.order_no;
		if (state.tableData.param.phone) params.phone = state.tableData.param.phone;
		if (state.tableData.param.status) params.status = state.tableData.param.status;
		if (state.tableData.param.pay_method) params.pay_method = state.tableData.param.pay_method;
		const res = await orderApi.list(params);
		if (res.code === 0 && res.data) {
			state.tableData.data = res.data.list || [];
			state.tableData.total = res.data.total || 0;
		}
	} finally { state.tableData.loading = false; }
};

const onOpenEdit = (type: string, row: RowOrderType) => {
	orderDialogRef.value.openDialog(type, row);
};

const onDeliver = (row: RowOrderType) => {
	orderDialogRef.value.openDialog('deliver', row);
};

const onConfirmPayment = (row: RowOrderType) => {
	ElMessageBox.confirm(`确认订单"${row.order_no}"已收到款项？`, '确认收款', {
		confirmButtonText: '确认收款',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const res = await orderApi.confirmPayment(row.id);
			if (res.code === 0) { ElMessage.success('收款确认成功'); getTableData(); }
			else ElMessage.error(res.message || '操作失败');
		})
		.catch(() => {});
};

const onRefund = (row: RowOrderType) => {
	ElMessageBox.confirm(`确认对订单"${row.order_no}"进行退款？`, '提示', {
		confirmButtonText: '确认退款',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const res = await orderApi.refund(row.id);
			if (res.code === 0) { ElMessage.success('退款成功'); getTableData(); }
			else ElMessage.error(res.message || '退款失败');
		})
		.catch(() => {});
};

const onExport = async () => {
	try {
		const res = await orderApi.exportOrders({
			status: state.tableData.param.status || undefined,
		});
		if (res.code === 0 && res.data) {
			ElMessage.success(`导出成功，共 ${Array.isArray(res.data) ? res.data.length : 0} 条订单`);
		} else ElMessage.error(res.message || '导出失败');
	} catch { ElMessage.error('导出失败'); }
};

const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};

const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};

onMounted(() => {
	getTableData();
});
</script>

<style scoped lang="scss">
.business-order-container {
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
