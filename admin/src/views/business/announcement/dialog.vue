<template>
	<div class="business-announcement-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="600px">
			<el-form ref="announcementDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="公告内容">
							<el-input v-model="state.ruleForm.content" type="textarea" placeholder="请输入公告内容" maxlength="200" :rows="3"></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="排序">
							<el-input-number v-model="state.ruleForm.sort_order" :min="0" :max="999" controls-position="right" class="w100" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="状态">
							<el-switch v-model="state.ruleForm.status" :active-value="1" :inactive-value="0" inline-prompt active-text="显示" inactive-text="隐藏"></el-switch>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="businessAnnouncementDialog">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAnnouncementApi } from '/@/api/announcement/index';

const emit = defineEmits(['refresh']);
const announcementApi = useAnnouncementApi();
const announcementDialogFormRef = ref();

const defaultForm = { content: '', sort_order: 0, status: 1 };

const state = reactive({
	ruleForm: { ...defaultForm } as any,
	dialog: { isShowDialog: false, type: '', title: '', submitTxt: '' },
});

const openDialog = (type: string, row?: RowAnnouncementType) => {
	if (type === 'edit' && row) {
		state.ruleForm = { ...row };
		state.dialog.title = '修改公告';
		state.dialog.submitTxt = '修 改';
		state.dialog.type = 'edit';
	} else {
		state.ruleForm = { ...defaultForm };
		state.dialog.title = '新增公告';
		state.dialog.submitTxt = '新 增';
		state.dialog.type = 'add';
	}
	state.dialog.isShowDialog = true;
};

const closeDialog = () => { state.dialog.isShowDialog = false; };
const onCancel = () => closeDialog();

const onSubmit = async () => {
	try {
		let res;
		if (state.dialog.type === 'edit') {
			res = await announcementApi.update(state.ruleForm.id, state.ruleForm);
		} else {
			res = await announcementApi.create(state.ruleForm);
		}
		if (res.code === 0) { ElMessage.success(state.dialog.type === 'edit' ? '修改成功' : '新增成功'); closeDialog(); emit('refresh'); }
		else ElMessage.error(res.message || '操作失败');
	} catch { ElMessage.error('请求失败'); }
};

defineExpose({ openDialog });
</script>
