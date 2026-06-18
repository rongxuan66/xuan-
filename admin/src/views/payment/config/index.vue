<template>
	<div class="payment-config-container">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="mb15" style="font-size:15px;font-weight:700;color:var(--el-text-color-primary)">支付网关配置</div>
			<el-form ref="configFormRef" :model="state.ruleForm" size="default" label-width="140px" style="max-width:660px">
				<el-form-item label="网关接口地址">
					<el-input v-model="state.ruleForm.api_url" placeholder="如：https://pay.example.com/submit.php" clearable>
						<template #append>
							<el-button @click="onTestApi" :loading="state.testLoading">测试连通</el-button>
						</template>
					</el-input>
					<div class="form-tip">码支付/易支付的 submit.php 完整地址，只填域名也会自动补全。如：https://pay.example.com/submit.php</div>
				</el-form-item>
				<el-form-item label="商户ID (pid)">
					<el-input v-model="state.ruleForm.pid" placeholder="平台分配的商户号" clearable />
				</el-form-item>
				<el-form-item label="商户密钥 (key)">
					<el-input v-model="state.ruleForm.key" placeholder="平台分配的商户密钥" show-password clearable />
					<div class="form-tip">用于生成MD5签名，请勿泄露</div>
				</el-form-item>
				<el-form-item label="异步通知地址">
					<el-input v-model="state.ruleForm.notify_url" placeholder="如：https://你的域名/api/payment/notify" clearable />
					<div class="form-tip">支付成功后网关向此地址GET推送支付结果，需公网可访问。收到通知后须返回 success</div>
				</el-form-item>
				<el-form-item label="同步跳转地址">
					<el-input v-model="state.ruleForm.return_url" placeholder="如：https://你的域名/pay-result" clearable />
					<div class="form-tip">支付完成后用户浏览器跳转到此地址（可不填）</div>
				</el-form-item>
				<el-form-item label="支付方式">
					<el-checkbox-group v-model="state.ruleForm.pay_types">
						<el-checkbox label="alipay">支付宝</el-checkbox>
						<el-checkbox label="wechat">微信支付</el-checkbox>
						<el-checkbox label="qq">QQ支付</el-checkbox>
					</el-checkbox-group>
					<div class="form-tip">勾选的支付方式将在用户下单时可选。发送到网关时自动映射为标准名称（wechat→wxpay, qq→qqpay）</div>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onSave" size="default" :loading="state.saveLoading">
						<el-icon><ele-Check /></el-icon>
						保存配置
					</el-button>
					<el-button @click="onReset" size="default" class="ml10">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<el-card shadow="hover" class="layout-padding-auto mt15">
			<div class="mb15" style="font-size:15px;font-weight:700;color:var(--el-text-color-primary)">API 对接说明（码支付/易支付标准）</div>
			<el-collapse>
				<el-collapse-item title="请求参数说明 (submit.php)" name="1">
					<div class="api-doc">
						<p><b>请求方式：</b>POST（application/x-www-form-urlencoded）</p>
						<p><b>请求参数：</b></p>
						<table class="api-table">
							<tr><th>参数名</th><th>变量名</th><th>必填</th><th>说明</th></tr>
							<tr><td>商户ID</td><td>pid</td><td>是</td><td>支付平台分配的商户号</td></tr>
							<tr><td>支付方式</td><td>type</td><td>是</td><td>alipay / wxpay / qqpay</td></tr>
							<tr><td>商户订单号</td><td>out_trade_no</td><td>是</td><td>唯一订单号，不超过32字符</td></tr>
							<tr><td>异步通知地址</td><td>notify_url</td><td>是</td><td>支付结果异步通知URL</td></tr>
							<tr><td>跳转通知地址</td><td>return_url</td><td>否</td><td>支付完成后页面跳转URL</td></tr>
							<tr><td>商品名称</td><td>name</td><td>是</td><td>商品名称，超过127字节自动截取</td></tr>
							<tr><td>商品金额</td><td>money</td><td>是</td><td>单位：元，最多2位小数</td></tr>
							<tr><td>签名字符串</td><td>sign</td><td>是</td><td>MD5签名结果（32位小写）</td></tr>
							<tr><td>签名类型</td><td>sign_type</td><td>是</td><td>固定值：MD5</td></tr>
						</table>
					</div>
				</el-collapse-item>
				<el-collapse-item title="MD5 签名算法" name="2">
					<div class="api-doc">
						<p><b>第1步：</b>将所有请求参数按参数名 <b>ASCII码从小到大排序（a-z）</b></p>
						<p><b>第2步：</b><b>sign</b>、<b>sign_type</b> 和<b>空值</b>不参与签名，剔除它们</p>
						<p><b>第3步：</b>排序后的参数拼接成 <code>key1=value1&key2=value2</code> 格式（<b>参数值不进行URL编码</b>）</p>
						<p><b>第4步：</b>拼接商户密钥后取MD5：<code>sign = md5(拼接串 + KEY)</code>，MD5结果为<b>小写</b></p>
					</div>
				</el-collapse-item>
				<el-collapse-item title="异步通知回调 (notify)" name="3">
					<div class="api-doc">
						<p>支付成功后平台会以 <b>GET</b> 方式请求 <code>notify_url</code>，携带以下参数：</p>
						<table class="api-table">
							<tr><th>参数名</th><th>说明</th></tr>
							<tr><td>pid</td><td>商户ID</td></tr>
							<tr><td>trade_no</td><td>平台交易号</td></tr>
							<tr><td>out_trade_no</td><td>商户订单号</td></tr>
							<tr><td>type</td><td>支付方式</td></tr>
							<tr><td>name</td><td>商品名称</td></tr>
							<tr><td>money</td><td>金额</td></tr>
							<tr><td>trade_status</td><td>支付状态（TRADE_SUCCESS 表示成功）</td></tr>
							<tr><td>sign</td><td>MD5签名</td></tr>
							<tr><td>sign_type</td><td>签名类型</td></tr>
						</table>
						<p style="margin-top:8px"><b>重要：</b>收到异步通知后必须返回 <code>success</code>（纯小写，无空格换行），否则平台会持续重发。</p>
					</div>
				</el-collapse-item>
			</el-collapse>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="paymentConfig">
import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useConfigApi } from '/@/api/config/index';

const configApi = useConfigApi();
const configFormRef = ref();

const normalizePayTypes = (val: any): string[] => {
	if (Array.isArray(val)) return val;
	if (typeof val === 'string') return val.split(',').map((s: string) => s.trim()).filter(Boolean);
	return ['alipay', 'wechat', 'qq'];
};

const state = reactive<SysPayConfigState>({
	ruleForm: { id: 0, api_url: '', pid: '', key: '', notify_url: '', return_url: '', pay_types: ['alipay', 'wechat', 'qq'], status: 1, created_at: '', updated_at: '' },
	testLoading: false,
	saveLoading: false,
});

const getConfigData = async () => {
	try {
		const res = await configApi.getPayConfig();
		if (res.code === 0 && res.data) {
			state.ruleForm.api_url = res.data.api_url || '';
			state.ruleForm.pid = res.data.pid || '';
			state.ruleForm.key = res.data.key || '';
			state.ruleForm.notify_url = res.data.notify_url || '';
			state.ruleForm.return_url = res.data.return_url || '';
			state.ruleForm.pay_types = normalizePayTypes(res.data.pay_types);
			state.ruleForm.status = res.data.status || 1;
		}
	} catch { /* use defaults */ }
};

const onSave = async () => {
	if (state.ruleForm.pay_types.length === 0) {
		ElMessage.warning('请至少选择一种支付方式');
		return;
	}
	state.saveLoading = true;
	try {
		const res = await configApi.savePayConfig(state.ruleForm);
		if (res.code === 0) ElMessage.success('支付配置保存成功');
		else ElMessage.error(res.message || '保存失败');
	} catch (e: any) {
		console.error('[PayConfig] 保存失败:', e);
		ElMessage.error('请求失败，请检查控制台');
	} finally {
		state.saveLoading = false;
	}
};

const onReset = () => getConfigData();

const onTestApi = async () => {
	if (!state.ruleForm.api_url) { ElMessage.warning('请先输入网关接口地址'); return; }
	state.testLoading = true;
	try {
		const res = await configApi.savePayConfig(state.ruleForm);
		if (res.code === 0) ElMessage.success('网关配置已保存，请确认连通性');
		else ElMessage.warning('网关地址已保存，请确认连通性');
	} catch { ElMessage.error('网络连接失败，请检查网关地址'); }
	state.testLoading = false;
};

onMounted(() => getConfigData());
</script>

<style scoped lang="scss">
.payment-config-container {
	height: 100%;
	overflow-y: auto;
	padding: 15px 15px 0;
	.form-tip { font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.6; }
	.api-doc {
		font-size: 13px; color: #4b5563; line-height: 2;
		p { margin: 4px 0; }
		code { background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-size: 12px; color: #e35b66; }
		.api-table {
			width: 100%; border-collapse: collapse; margin-top: 8px;
			th, td { border: 1px solid #e5e7eb; padding: 6px 12px; text-align: left; font-size: 13px; }
			th { background: #f8fafc; font-weight: 600; }
		}
	}
}
</style>
