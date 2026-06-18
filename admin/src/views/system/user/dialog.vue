<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="500px">
			<el-form ref="userDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="用户名">
							<el-input v-model="state.ruleForm.username" placeholder="请输入用户名" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="昵称">
							<el-input v-model="state.ruleForm.nickname" placeholder="请输入昵称" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="角色">
							<el-select v-model="state.ruleForm.role" placeholder="请选择角色" class="w100">
								<el-option label="超级管理员" value="admin"></el-option>
								<el-option label="编辑员" value="editor"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="密码">
							<el-input v-model="state.ruleForm.password" placeholder="请输入密码" type="password" clearable></el-input>
							<div class="form-tip">{{ state.dialog.type === 'edit' ? '留空则不修改密码' : '请输入管理员登录密码' }}</div>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="状态">
							<el-switch v-model="state.ruleForm.status" :active-value="1" :inactive-value="0" inline-prompt active-text="启用" inactive-text="禁用"></el-switch>
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

<script setup lang="ts" name="systemUserDialog">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAdminApi } from '/@/api/admin/index';

const emit = defineEmits(['refresh']);
const userDialogFormRef = ref();
const adminApi = useAdminApi();

const defaultForm = {
	username: '',
	nickname: '',
	role: 'editor',
	password: '',
	status: 1,
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

const openDialog = (type: string, row?: any) => {
	if (type === 'edit' && row) {
		state.ruleForm = { ...row, password: '' };
		state.dialog.title = '修改管理员';
		state.dialog.submitTxt = '修 改';
		state.dialog.type = 'edit';
	} else {
		state.ruleForm = { ...defaultForm };
		state.dialog.title = '新增管理员';
		state.dialog.submitTxt = '新 增';
		state.dialog.type = 'add';
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
	if (!state.ruleForm.username) { ElMessage.warning('请输入用户名'); return; }
	if (state.dialog.type === 'add' && !state.ruleForm.password) { ElMessage.warning('请输入密码'); return; }
	state.submitLoading = true;
	try {
		let res;
		const data: any = {
			username: state.ruleForm.username,
			nickname: state.ruleForm.nickname,
			role: state.ruleForm.role,
			status: state.ruleForm.status,
		};
		if (state.ruleForm.password) data.password = state.ruleForm.password;
		if (state.dialog.type === 'edit') {
			res = await adminApi.update(state.ruleForm.id, data);
		} else {
			res = await adminApi.create(data);
		}
		if (res.code === 0) { ElMessage.success(state.dialog.type === 'edit' ? '修改成功' : '新增成功'); closeDialog(); emit('refresh'); }
		else ElMessage.error(res.message || '操作失败');
	} catch { ElMessage.error('请求失败'); }
	state.submitLoading = false;
};

defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
.form-tip { font-size: 12px; color: #94a3b8; margin-top: 4px; }
</style>
