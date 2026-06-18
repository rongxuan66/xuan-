<template>
	<div class="business-product-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="900px">
			<el-form ref="productDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="商品标题">
							<el-input v-model="state.ruleForm.title" placeholder="请输入商品标题" maxlength="200" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="所属平台">
							<el-select v-model="state.ruleForm.platform" placeholder="请选择平台" class="w100" clearable>
								<el-option v-for="p in state.platforms" :key="p.platform_key" :label="p.name" :value="p.platform_key"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="售价">
							<el-input-number v-model="state.ruleForm.price" :min="0" :precision="2" controls-position="right" class="w100" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="原价">
							<el-input-number v-model="state.ruleForm.original_price" :min="0" :precision="2" controls-position="right" class="w100" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="库存">
							<el-input-number v-model="state.ruleForm.stock" :min="0" controls-position="right" class="w100" :disabled="state.hasCards" />
							<div v-if="state.hasCards" style="font-size:12px;color:#909399;line-height:1.4">库存由卡号自动计算，请通过卡号管理调整</div>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="商品图片">
							<UploadImage v-model="state.ruleForm.images" :limit="6" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="上架状态">
							<el-switch v-model="state.ruleForm.status" :active-value="1" :inactive-value="0" inline-prompt active-text="上架" inactive-text="下架"></el-switch>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="商品介绍">
							<el-input v-model="state.ruleForm.description" type="textarea" placeholder="请输入商品介绍" maxlength="5000" :rows="4"></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="使用说明">
							<el-input v-model="state.ruleForm.usage_guide" type="textarea" placeholder="请输入使用说明" maxlength="5000" :rows="4"></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="交付方式">
							<el-radio-group v-model="state.ruleForm.delivery_type">
								<el-radio value="card">支付成功发送卡密</el-radio>
								<el-radio value="url">支付成功访问URL</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col v-if="state.ruleForm.delivery_type === 'url'" :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="交付URL">
							<el-input v-model="state.ruleForm.delivery_url" placeholder="https://example.com/api?zrqq={ZRQQ}&jqrqq={JQRQQ}" clearable></el-input>
							<div style="font-size:12px;color:#909399;line-height:1.6;margin-top:4px">
								在URL中使用 <code>{变量名}</code> 引用自定义变量，例如 <code>{ZRQQ}</code>、<code>{JQRQQ}</code>
							</div>
						</el-form-item>
					</el-col>
					<el-col v-if="state.ruleForm.delivery_type === 'url'" :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="自定义输入项">
							<div style="width:100%">
								<div v-for="(field, idx) in state.ruleForm.custom_fields" :key="idx" style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
									<el-input v-model="field.label" placeholder="显示名称（如：主人QQ）" style="flex:1" clearable></el-input>
									<el-input v-model="field.var" placeholder="变量名（如：ZRQQ）" style="flex:1" clearable></el-input>
									<el-button @click="state.ruleForm.custom_fields.splice(idx, 1)" type="danger" :icon="'Delete'" circle size="small"></el-button>
								</div>
								<el-button @click="state.ruleForm.custom_fields.push({label:'',var:''})" type="primary" plain size="small">+ 添加输入项</el-button>
								<div style="font-size:12px;color:#909399;line-height:1.6;margin-top:8px">
									前台购买页面将显示对应输入框，用户填写后通过 <code>{变量名}</code> 在URL中引用
								</div>
							</div>
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

<script setup lang="ts" name="businessProductDialog">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import UploadImage from '/@/components/uploadImage/index.vue';
import { useProductApi } from '/@/api/product/index';
import { usePlatformApi } from '/@/api/platform/index';

const emit = defineEmits(['refresh']);
const productDialogFormRef = ref();
const productApi = useProductApi();
const platformApi = usePlatformApi();

const defaultForm = {
	title: '',
	platform: '',
	images: [] as string[],
	price: 0,
	original_price: 0,
	stock: 0,
	description: '',
	usage_guide: '',
	delivery_type: 'card',
	delivery_url: '',
	custom_fields: [] as { label: string; var: string }[],
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
	hasCards: false,
	platforms: [] as { platform_key: string; name: string }[],
});

const loadPlatforms = async () => {
	if (state.platforms.length) return;
	try {
		const res = await platformApi.list();
		if (res.code === 0 && res.data) {
			state.platforms = res.data;
		}
	} catch { /* ignore */ }
};

const openDialog = (type: string, row?: RowProductType) => {
	loadPlatforms();
	if (type === 'edit' && row) {
		state.ruleForm = { ...row };
		if (typeof state.ruleForm.images === 'string') {
			try { state.ruleForm.images = JSON.parse(state.ruleForm.images as string); } catch { state.ruleForm.images = []; }
		}
		if (typeof state.ruleForm.custom_fields === 'string') {
			try { state.ruleForm.custom_fields = JSON.parse(state.ruleForm.custom_fields as string); } catch { state.ruleForm.custom_fields = []; }
		}
		if (!state.ruleForm.custom_fields || !Array.isArray(state.ruleForm.custom_fields)) {
			state.ruleForm.custom_fields = [];
		}
		state.ruleForm.delivery_type = state.ruleForm.delivery_type || 'card';
		state.ruleForm.delivery_url = state.ruleForm.delivery_url || '';
		// 有卡号时使用实际可用卡号数作为库存
		if ((row as any).card_count > 0 && (row as any).remain_stock !== undefined) {
			state.ruleForm.stock = (row as any).remain_stock;
		}
		state.hasCards = (row as any).card_count > 0;
		state.dialog.title = '修改商品';
		state.dialog.submitTxt = '修 改';
		state.dialog.type = 'edit';
	} else {
		state.ruleForm = { ...defaultForm };
		state.dialog.title = '新增商品';
		state.dialog.submitTxt = '新 增';
		state.hasCards = false;
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
	if (!state.ruleForm.title) { ElMessage.warning('请输入商品标题'); return; }
	if (!state.ruleForm.platform) { ElMessage.warning('请选择所属平台'); return; }
	state.submitLoading = true;
	try {
		let res;
		if (state.dialog.type === 'edit') {
			res = await productApi.update(state.ruleForm.id, state.ruleForm);
		} else {
			res = await productApi.create(state.ruleForm);
		}
		if (res.code === 0) {
			ElMessage.success(state.dialog.type === 'edit' ? '修改成功' : '新增成功');
			closeDialog();
			emit('refresh');
		} else ElMessage.error(res.message || '操作失败');
	} catch { ElMessage.error('请求失败'); }
	state.submitLoading = false;
};

defineExpose({
	openDialog,
});
</script>
