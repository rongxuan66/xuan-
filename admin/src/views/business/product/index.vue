<template>
	<div class="business-product-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="business-product-search mb15">
				<el-input v-model="state.tableData.param.keyword" size="default" placeholder="商品标题" style="max-width: 180px"></el-input>
				<el-select v-model="state.tableData.param.platform" size="default" placeholder="所属平台" style="width: 130px" class="ml10" clearable>
					<el-option v-for="p in state.platforms" :key="p.platform_key" :label="p.name" :value="p.platform_key"></el-option>
				</el-select>
				<el-select v-model="state.tableData.param.status" size="default" placeholder="上架状态" style="width: 120px" class="ml10" clearable>
					<el-option label="上架" :value="1"></el-option>
					<el-option label="下架" :value="0"></el-option>
				</el-select>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon><ele-Search /></el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAdd('add')">
					<el-icon><ele-FolderAdd /></el-icon>
					新增商品
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column label="图片" width="80">
					<template #default="scope">
						<el-image v-if="scope.row.images && scope.row.images.length" :src="scope.row.images[0]" style="width:50px;height:50px;border-radius:6px;object-fit:cover" fit="cover" preview-teleported :preview-src-list="scope.row.images" />
						<span v-else style="color:#94a3b8">-</span>
					</template>
				</el-table-column>
				<el-table-column prop="title" label="商品标题" show-overflow-tooltip min-width="200"></el-table-column>
				<el-table-column prop="platform" label="所属平台" show-overflow-tooltip width="100">
					<template #default="scope">
						<el-tag>{{ platformName(scope.row.platform) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="price" label="售价" show-overflow-tooltip width="90">
					<template #default="scope">¥{{ Number(scope.row.price).toFixed(2) }}</template>
				</el-table-column>
				<el-table-column label="库存" show-overflow-tooltip width="70">
						<template #default="scope">{{ scope.row.card_count > 0 ? (scope.row.remain_stock !== undefined ? scope.row.remain_stock : scope.row.stock) : scope.row.stock }}</template>
					</el-table-column>
				<el-table-column prop="status" label="上架状态" show-overflow-tooltip width="90">
					<template #default="scope">
						<el-tag type="success" v-if="scope.row.status">上架</el-tag>
						<el-tag type="info" v-else>下架</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="created_at" label="创建时间" show-overflow-tooltip width="160"></el-table-column>
				<el-table-column label="操作" width="240" fixed="right">
					<template #default="scope">
						<el-button size="small" text type="primary" @click="onOpenEdit('edit', scope.row)">修改</el-button>
						<el-button size="small" text type="primary" @click="onStatusChange(scope.row)">
							{{ scope.row.status ? '下架' : '上架' }}
						</el-button>
						<el-button size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
						<el-button size="small" text type="primary" @click="onOpenCards(scope.row)">卡号</el-button>
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
		<ProductDialog ref="productDialogRef" @refresh="getTableData()" />
		<CardDialog ref="cardDialogRef" />
	</div>
</template>

<script setup lang="ts" name="businessProduct">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useProductApi } from '/@/api/product/index';
import { usePlatformApi } from '/@/api/platform/index';

const ProductDialog = defineAsyncComponent(() => import('/@/views/business/product/dialog.vue'));
const CardDialog = defineAsyncComponent(() => import('/@/views/business/product/cardDialog.vue'));
const productApi = useProductApi();
const platformApi = usePlatformApi();

const productDialogRef = ref();
const cardDialogRef = ref();
const state = reactive<SysProductState>({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: {
			keyword: '',
			platform: '',
			status: null,
			pageNum: 1,
			pageSize: 10,
		},
	},
	platforms: [] as { platform_key: string; name: string }[],
});

const platformName = (key: string) => {
	const found = state.platforms.find((p: any) => p.platform_key === key);
	return found ? found.name : key;
};

const loadPlatforms = async () => {
	try {
		const res = await platformApi.list();
		if (res.code === 0 && res.data) {
			state.platforms = res.data;
		}
	} catch { /* ignore */ }
};

const getTableData = async () => {
	state.tableData.loading = true;
	try {
		const params: any = { page: state.tableData.param.pageNum, pageSize: state.tableData.param.pageSize };
		if (state.tableData.param.keyword) params.keyword = state.tableData.param.keyword;
		if (state.tableData.param.platform) params.platform = state.tableData.param.platform;
		if (state.tableData.param.status !== null && state.tableData.param.status !== '') params.status = state.tableData.param.status;
		const res = await productApi.list(params);
		if (res.code === 0 && res.data) {
			state.tableData.data = (res.data.list || []).map((item: any) => {
				if (typeof item.images === 'string') {
					try { item.images = JSON.parse(item.images); } catch { item.images = []; }
				}
				return item;
			});
			state.tableData.total = res.data.total || 0;
		}
	} finally { state.tableData.loading = false; }
};

const onOpenAdd = (type: string) => {
	productDialogRef.value.openDialog(type);
};

const onOpenEdit = (type: string, row: RowProductType) => {
	productDialogRef.value.openDialog(type, row);
};

const onRowDel = (row: RowProductType) => {
	ElMessageBox.confirm(`此操作将永久删除商品："${row.title}"，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const res = await productApi.remove(row.id);
			if (res.code === 0) { ElMessage.success('删除成功'); getTableData(); }
			else ElMessage.error(res.message || '删除失败');
		})
		.catch(() => {});
};

const onOpenCards = (row: RowProductType) => {
		cardDialogRef.value.open(row.id);
	};

	const onStatusChange = async (row: RowProductType) => {
	const newStatus = row.status ? 0 : 1;
	const txt = row.status ? '下架' : '上架';
	ElMessageBox.confirm(`确认${txt}商品："${row.title}"？`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			const res = await productApi.update(row.id, { status: newStatus });
			if (res.code === 0) { ElMessage.success(`${txt}成功`); getTableData(); }
			else ElMessage.error(res.message || `${txt}失败`);
		})
		.catch(() => {});
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
	loadPlatforms();
	getTableData();
});
</script>

<style scoped lang="scss">
.business-product-container {
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
