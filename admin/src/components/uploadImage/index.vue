<template>
	<div class="upload-image">
		<div class="upload-image-list">
			<div class="upload-image-item" v-for="(img, index) in modelValue" :key="index">
				<img :src="img" class="upload-image-thumb" @click="onPreview(img)" />
				<div class="upload-image-actions">
					<el-icon @click="onPreview(img)"><ele-ZoomIn /></el-icon>
					<el-icon @click="onRemove(index)"><ele-Delete /></el-icon>
				</div>
			</div>
			<div class="upload-image-add" v-if="modelValue.length < limit && !uploading" @click="onOpenUpload">
				<el-icon class="upload-image-add-icon"><ele-Plus /></el-icon>
			</div>
			<div class="upload-image-add uploading" v-if="uploading">
				<el-icon class="upload-image-add-icon is-loading"><ele-Loading /></el-icon>
			</div>
		</div>
		<input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onFileChange" />
		<el-dialog v-model="previewVisible" title="图片预览" width="600px" destroy-on-close>
			<img :src="previewUrl" style="width:100%;border-radius:8px" />
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="uploadImage">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { Session } from '/@/utils/storage';

const props = withDefaults(defineProps<{
	modelValue: string[];
	limit?: number;
}>(), {
	modelValue: () => [],
	limit: 6,
});

const emit = defineEmits<{
	'update:modelValue': [value: string[]];
}>();

const fileInputRef = ref();
const previewVisible = ref(false);
const previewUrl = ref('');
const uploading = ref(false);

const getUploadUrl = () => {
	const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/';
	return base + 'admin/api/upload';
};

const onOpenUpload = () => {
	fileInputRef.value?.click();
};

const onFileChange = async (e: Event) => {
	const input = e.target as HTMLInputElement;
	if (!input.files || input.files.length === 0) return;
	const file = input.files[0];
	if (!file.type.startsWith('image/')) {
		ElMessage.warning('请选择图片文件');
		input.value = '';
		return;
	}
	if (file.size > 10 * 1024 * 1024) {
		ElMessage.warning('图片大小不能超过10MB');
		input.value = '';
		return;
	}
	uploading.value = true;
	try {
		const formData = new FormData();
		formData.append('file', file);
		const headers: any = {};
		if (Session.get('token')) {
			headers['Authorization'] = 'Bearer ' + Session.get('token');
		}
		const res = await axios.post(getUploadUrl(), formData, {
			headers,
			timeout: 30000,
		});
		if (res.data && res.data.code === 0 && res.data.data && res.data.data.url) {
			const url = res.data.data.url;
			const newValue = [...props.modelValue, url];
			emit('update:modelValue', newValue);
		} else {
			ElMessage.error((res.data && res.data.message) || '上传失败');
		}
	} catch {
		ElMessage.error('上传失败，请检查网络');
	}
	uploading.value = false;
	input.value = '';
};

const onRemove = (index: number) => {
	const newValue = [...props.modelValue];
	newValue.splice(index, 1);
	emit('update:modelValue', newValue);
};

const onPreview = (url: string) => {
	previewUrl.value = url;
	previewVisible.value = true;
};
</script>

<style scoped lang="scss">
.upload-image {
	.upload-image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.upload-image-item {
		width: 100px;
		height: 100px;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
		overflow: hidden;
		position: relative;
		cursor: pointer;
		&:hover .upload-image-actions {
			opacity: 1;
		}
	}
	.upload-image-thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.upload-image-actions {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		justify-content: space-around;
		padding: 5px 0;
		opacity: 0;
		transition: opacity 0.2s;
		.el-icon {
			color: #fff;
			font-size: 16px;
			&:hover {
				color: #409eff;
			}
		}
	}
	.upload-image-add {
		width: 100px;
		height: 100px;
		border-radius: 8px;
		border: 2px dashed #d1d5db;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: border-color 0.2s;
		&:hover {
			border-color: #409eff;
		}
		.upload-image-add-icon {
			font-size: 28px;
			color: #9ca3af;
		}
	}
}
</style>
