<template>
	<div class="business-product-cards-dialog">
		<el-dialog title="卡号管理" v-model="state.isShow" width="700px" @open="onOpen">
			<div style="margin-bottom:15px">
				<el-input v-model="state.cardInput" type="textarea" :rows="3" placeholder="批量导入卡号，一行一个" />
				<el-button type="primary" size="default" style="margin-top:8px" :loading="state.importLoading" @click="onImport">导入卡号</el-button>
			</div>
			<el-table :data="state.cards" v-loading="state.loading" max-height="400" style="width:100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="card_no" label="卡号" show-overflow-tooltip min-width="200" />
				<el-table-column label="状态" width="100">
					<template #default="{ row }">
						<el-tag :type="row.status === 0 ? 'success' : 'info'">{{ row.status === 0 ? '可用' : '已售出' }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="关联订单" width="180" show-overflow-tooltip>
					<template #default="{ row }">{{ row.order_id ? row.order_id : '-' }}</template>
				</el-table-column>
				<el-table-column label="操作" width="80">
					<template #default="{ row }">
						<el-popconfirm title="确认删除此卡号？" @confirm="onDelete(row)">
							<template #reference>
								<el-button size="small" text type="danger" :disabled="row.status !== 0">删除</el-button>
							</template>
						</el-popconfirm>
					</template>
				</el-table-column>
			</el-table>
			<template #footer>
				<el-button @click="state.isShow = false">关 闭</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="businessProductCards">
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useProductApi } from '/@/api/product/index';

const productApi = useProductApi();

const state = reactive({
	isShow: false,
	loading: false,
	importLoading: false,
	productId: 0,
	cards: [] as any[],
	cardInput: '',
});

const loadCards = async () => {
	if (!state.productId) return;
	state.loading = true;
	try {
		const res = await productApi.cards(state.productId);
		if (res.code === 0 && res.data) {
			state.cards = res.data;
		}
	} finally { state.loading = false; }
};

const onOpen = () => {
	state.cardInput = '';
	loadCards();
};

const onImport = async () => {
	const lines = state.cardInput.split(/[\n\r]+/).map(s => s.trim()).filter(Boolean);
	if (!lines.length) { ElMessage.warning('请输入卡号'); return; }
	state.importLoading = true;
	try {
		const cards = lines.map(c => ({ card_no: c }));
		const res = await productApi.importCards(state.productId, { cards });
		if (res.code === 0) {
			ElMessage.success(res.message || '导入成功');
			state.cardInput = '';
			loadCards();
		} else {
			ElMessage.error(res.message || '导入失败');
		}
	} catch { ElMessage.error('请求失败'); }
	state.importLoading = false;
};

const onDelete = async (row: any) => {
	try {
		const res = await productApi.deleteCard(row.id);
		if (res.code === 0) {
			ElMessage.success('删除成功');
			loadCards();
		} else {
			ElMessage.error(res.message || '删除失败');
		}
	} catch { ElMessage.error('请求失败'); }
};

const open = (productId: number) => {
	state.productId = productId;
	state.isShow = true;
};

defineExpose({ open });
</script>
