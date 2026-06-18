<template>
	<div class="business-config-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="mb15" style="font-size:15px;font-weight:700;color:var(--el-text-color-primary)">基础配置</div>
			<el-form ref="configFormRef" :model="state.ruleForm" size="default" label-width="130px" style="max-width:600px">
				<el-form-item label="站点名称">
					<el-input v-model="state.ruleForm.site_name" placeholder="请输入站点名称" clearable></el-input>
				</el-form-item>
				<el-form-item label="站点描述">
					<el-input v-model="state.ruleForm.site_description" placeholder="请输入站点描述" type="textarea" :rows="2"></el-input>
				</el-form-item>
				<el-form-item label="客服微信">
					<el-input v-model="state.ruleForm.service_wechat" placeholder="请输入客服微信" clearable></el-input>
				</el-form-item>
				<el-form-item label="支付超时时间(分钟)">
					<el-input-number v-model="state.ruleForm.pay_timeout_minutes" :min="1" :max="120" controls-position="right" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onSave" size="default">
						<el-icon><ele-Check /></el-icon>
						保存配置
					</el-button>
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="businessConfig">
import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useConfigApi } from '/@/api/config/index';

const configApi = useConfigApi();
const configFormRef = ref();
const state = reactive({
	ruleForm: { site_name: '', site_description: '', service_wechat: '', pay_timeout_minutes: 15 },
});

const getConfigData = async () => {
	try {
		const res = await configApi.list();
		if (res.code === 0 && Array.isArray(res.data)) {
			const cfgMap: any = {};
			res.data.forEach((item: any) => { cfgMap[item.config_key] = item.config_value; });
			state.ruleForm.site_name = cfgMap.site_name || '';
			state.ruleForm.site_description = cfgMap.site_description || '';
			state.ruleForm.service_wechat = cfgMap.service_wechat || '';
			state.ruleForm.pay_timeout_minutes = parseInt(cfgMap.pay_timeout_minutes) || 15;
		}
	} catch { /* use defaults */ }
};

const onSave = async () => {
	try {
		const res = await configApi.update({
			configs: [
				{ config_key: 'site_name', config_value: state.ruleForm.site_name },
				{ config_key: 'site_description', config_value: state.ruleForm.site_description },
				{ config_key: 'service_wechat', config_value: state.ruleForm.service_wechat },
				{ config_key: 'pay_timeout_minutes', config_value: String(state.ruleForm.pay_timeout_minutes) },
			],
		});
		if (res.code === 0) ElMessage.success('配置保存成功');
		else ElMessage.error(res.message || '保存失败');
	} catch { ElMessage.error('保存失败'); }
};

onMounted(() => getConfigData());
</script>

<style scoped lang="scss">
.business-config-container {
	:deep(.el-card__body) { display: flex; flex-direction: column; flex: 1; overflow: auto; }
}
</style>
