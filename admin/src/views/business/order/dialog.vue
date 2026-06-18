<template>
	<div class="business-order-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="600px">
			<el-form ref="orderDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="订单编号">
							<el-input v-model="state.ruleForm.order_no" disabled></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="商品标题">
							<el-input v-model="state.ruleForm.product_title" disabled></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="订单金额">
							<el-input :value="'¥' + Number(state.ruleForm.price).toFixed(2)" disabled></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="支付方式">
							<el-input v-model="state.ruleForm.pay_method" disabled></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="手机号">
							<el-input v-model="state.ruleForm.phone" placeholder="请输入手机号" maxlength="20" :disabled="state.dialog.type === 'deliver'"></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="订单状态">
							<el-select v-model="state.ruleForm.status" placeholder="请选择" class="w100" :disabled="state.dialog.type === 'deliver'">
								<el-option label="待支付" value="pending"></el-option>
								<el-option label="已支付" value="paid"></el-option>
								<el-option label="已退款" value="refunded"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="发货账号">
							<el-input v-model="state.ruleForm.account" placeholder="请输入发货账号" maxlength="100"></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="发货密码">
							<el-input v-model="state.ruleForm.password" placeholder="请输入发货密码" maxlength="50"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default" :loading="state.submitLoading">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="businessOrderDialog">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useOrderApi } from '/@/api/order/index';

const emit = defineEmits(['refresh']);
const orderDialogFormRef = ref();
const orderApi = useOrderApi();

const defaultForm = {
	order_no: '',
	product_title: '',
	price: 0,
	phone: '',
	pay_method: '',
	status: 'paid',
	account: '',
	password: '',
};

const state = reactive({
	ruleForm: { ...defaultForm } as any,
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
	submitLoading: false,
});

const openDialog = (type: string, row?: RowOrderType) => {
	if (type === 'deliver' && row) {
		state.ruleForm = { ...row, account: row.account || '', password: row.password || '' };
		state.dialog.title = '手动发货';
		state.dialog.submitTxt = '确认发货';
		state.dialog.type = 'deliver';
	} else if (type === 'edit' && row) {
		state.ruleForm = { ...row };
		state.dialog.title = '订单详情';
		state.dialog.submitTxt = '保 存';
		state.dialog.type = 'edit';
	} else {
		state.ruleForm = { ...defaultForm };
		state.dialog.title = '订单详情';
		state.dialog.submitTxt = '关 闭';
		state.dialog.type = 'view';
	}
	state.dialog.isShowDialog = true;
};

const closeDialog = () => {
	state.dialog.isShowDialog = false;
};

const onCancel = () => {
	closeDialog();
};

const onSubmit = async () => {
	if (state.dialog.type === 'deliver') {
		if (!state.ruleForm.account) { ElMessage.warning('请输入发货账号'); return; }
		state.submitLoading = true;
		try {
			const res = await orderApi.deliver(state.ruleForm.id, {
				account: state.ruleForm.account,
				password: state.ruleForm.password,
			});
			if (res.code === 0) { ElMessage.success('发货成功'); closeDialog(); emit('refresh'); }
			else ElMessage.error(res.message || '发货失败');
		} catch { ElMessage.error('请求失败'); }
		state.submitLoading = false;
	} else {
		closeDialog();
		emit('refresh');
	}
};

defineExpose({
	openDialog,
});
</script>
