<template>
	<div class="payment-record-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="payment-record-search mb15">
				<el-input v-model="state.tableData.param.out_trade_no" size="default" placeholder="订单编号" style="max-width:200px"></el-input>
				<el-select v-model="state.tableData.param.pay_method" size="default" placeholder="支付方式" style="width:120px" class="ml10" clearable>
					<el-option label="微信" value="wechat"></el-option>
					<el-option label="支付宝" value="alipay"></el-option>
					<el-option label="QQ" value="qq"></el-option>
				</el-select>
				<el-select v-model="state.tableData.param.status" size="default" placeholder="支付状态" style="width:120px" class="ml10" clearable>
					<el-option label="已支付" value="paid"></el-option>
					<el-option label="待支付" value="pending"></el-option>
					<el-option label="已退款" value="refunded"></el-option>
				</el-select>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon><ele-Search /></el-icon>
					查询
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="order_no" label="订单编号" show-overflow-tooltip min-width="180"></el-table-column>
				<el-table-column prop="product_title" label="商品名称" show-overflow-tooltip min-width="150"></el-table-column>
				<el-table-column prop="price" label="支付金额" show-overflow-tooltip width="100">
					<template #default="scope">¥{{ Number(scope.row.price).toFixed(2) }}</template>
				</el-table-column>
				<el-table-column prop="pay_method" label="支付方式" show-overflow-tooltip width="100">
					<template #default="scope">
						<el-tag v-if="scope.row.pay_method === 'wechat'" type="success" size="small">微信</el-tag>
						<el-tag v-else-if="scope.row.pay_method === 'alipay'" type="primary" size="small">支付宝</el-tag>
						<el-tag v-else-if="scope.row.pay_method === 'qq'" type="info" size="small">QQ</el-tag>
						<el-tag v-else size="small">{{ scope.row.pay_method }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="支付状态" show-overflow-tooltip width="110">
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status === 'paid'" size="small">已支付</el-tag>
						<el-tag type="warning" v-else-if="scope.row.status === 'pending'" size="small">待支付</el-tag>
						<el-tag type="info" v-else-if="scope.row.status === 'refunded'" size="small">已退款</el-tag>
						<el-tag v-else size="small">{{ scope.row.status }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="paid_at" label="支付时间" show-overflow-tooltip width="160">
					<template #default="scope">{{ scope.row.paid_at || '-' }}</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" show-overflow-tooltip width="160"></el-table-column>
				<el-table-column label="操作" width="120" fixed="right">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="onViewDetail(scope.row)">详情</el-button>
						<el-button size="small" text type="primary" @click="onRefund(scope.row)" v-if="scope.row.status === 'paid'">退款</el-button>
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

		<el-dialog v-model="state.detailVisible" title="交易详情" width="580px" destroy-on-close>
			<el-descriptions :column="2" border size="default">
				<el-descriptions-item label="订单编号">{{ state.currentRow.order_no }}</el-descriptions-item>
				<el-descriptions-item label="商品名称">{{ state.currentRow.product_title }}</el-descriptions-item>
				<el-descriptions-item label="支付金额">¥{{ Number(state.currentRow.price || 0).toFixed(2) }}</el-descriptions-item>
				<el-descriptions-item label="支付方式">{{ state.currentRow.pay_method }}</el-descriptions-item>
				<el-descriptions-item label="支付状态">
					<el-tag type="success" v-if="state.currentRow.status === 'paid'" size="small">已支付</el-tag>
					<el-tag type="warning" v-else-if="state.currentRow.status === 'pending'" size="small">待支付</el-tag>
					<el-tag type="info" v-else size="small">{{ state.currentRow.status }}</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="手机号">{{ state.currentRow.phone }}</el-descriptions-item>
				<el-descriptions-item label="支付时间">{{ state.currentRow.paid_at || '-' }}</el-descriptions-item>
				<el-descriptions-item label="创建时间">{{ state.currentRow.created_at }}</el-descriptions-item>
			</el-descriptions>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="paymentRecord">
import { reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useOrderApi } from '/@/api/order/index';

const orderApi = useOrderApi();

const state = reactive<any>({
	tableData: { data: [], total: 0, loading: false, param: { pageNum: 1, pageSize: 10, out_trade_no: '', pay_method: '', status: '' } },
	detailVisible: false,
	currentRow: {} as any,
});

const getTableData = async () => {
	state.tableData.loading = true;
	try {
		const params: any = { page: state.tableData.param.pageNum, pageSize: state.tableData.param.pageSize };
		if (state.tableData.param.out_trade_no) params.order_no = state.tableData.param.out_trade_no;
		if (state.tableData.param.pay_method) params.pay_method = state.tableData.param.pay_method;
		if (state.tableData.param.status) params.status = state.tableData.param.status;
		const res = await orderApi.list(params);
		if (res.code === 0 && res.data) {
			state.tableData.data = res.data.list || [];
			state.tableData.total = res.data.total || 0;
		}
	} finally { state.tableData.loading = false; }
};

const onHandleSizeChange = (val: number) => { state.tableData.param.pageSize = val; getTableData(); };
const onHandleCurrentChange = (val: number) => { state.tableData.param.pageNum = val; getTableData(); };

const onViewDetail = (row: any) => { state.currentRow = row; state.detailVisible = true; };

const onRefund = (row: any) => {
	ElMessageBox.confirm(`确认对订单 ${row.order_no} 发起退款？`, '退款确认', { confirmButtonText: '确认退款', cancelButtonText: '取消', type: 'warning' })
		.then(async () => {
			const res = await orderApi.refund(row.id);
			if (res.code === 0) { ElMessage.success('退款成功'); getTableData(); }
			else ElMessage.error(res.message || '退款失败');
		}).catch(() => {});
};

onMounted(() => getTableData());
</script>

<style scoped lang="scss">
.payment-record-container {
	:deep(.el-card__body) { display: flex; flex-direction: column; flex: 1; overflow: auto; }
}
</style>
