<template>
	<div class="login-form">
		<div class="form-item">
			<div class="input-wrapper">
				<el-icon class="input-icon"><ele-User /></el-icon>
				<input
					class="form-input"
					type="text"
					:placeholder="$t('message.account.accountPlaceholder1')"
					v-model="state.ruleForm.userName"
					autocomplete="off"
				/>
			</div>
		</div>
		<div class="form-item">
			<div class="input-wrapper">
				<el-icon class="input-icon"><ele-Unlock /></el-icon>
				<input
					class="form-input"
					:type="state.isShowPassword ? 'text' : 'password'"
					:placeholder="$t('message.account.accountPlaceholder2')"
					v-model="state.ruleForm.password"
					autocomplete="off"
				/>
				<span class="input-suffix" @click="state.isShowPassword = !state.isShowPassword">
					<el-icon v-if="state.isShowPassword"><ele-View /></el-icon>
					<el-icon v-else><ele-Hide /></el-icon>
				</span>
			</div>
		</div>
		<div class="form-item">
			<button class="btn-submit" @click="onSignIn" :disabled="state.loading.signIn">
				<span v-if="!state.loading.signIn">{{ $t('message.account.accountBtnText') }}</span>
				<span v-else class="loading-dots">登录中...</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts" name="loginAccount">
import { reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useUserInfo } from '/@/stores/userInfo';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import { useAuthApi } from '/@/api/auth/index';

const { t } = useI18n();
const storesThemeConfig = useThemeConfig();
const storesUserInfo = useUserInfo();
const { themeConfig } = storeToRefs(storesThemeConfig);
const route = useRoute();
const router = useRouter();
const authApi = useAuthApi();
const state = reactive({
	isShowPassword: false,
	ruleForm: {
		userName: 'admin',
		password: 'admin123',
	},
	loading: {
		signIn: false,
	},
});

const currentTime = computed(() => {
	return formatAxis(new Date());
});

const onSignIn = async () => {
	state.loading.signIn = true;
	try {
		const res = await authApi.login({
			username: state.ruleForm.userName,
			password: state.ruleForm.password,
		});
		if (res.code === 0) {
			Session.set('token', res.data.token);
			Session.set('userInfo', {
				userName: res.data.user.username,
				photo: res.data.user.avatar || '',
				time: new Date().getTime(),
				roles: [res.data.user.role],
				authBtnList: ['btn.add', 'btn.del', 'btn.edit', 'btn.link'],
			});
			storesUserInfo.setUserInfos();
			if (!themeConfig.value.isRequestRoutes) {
				const isNoPower = await initFrontEndControlRoutes();
				signInSuccess(isNoPower);
			} else {
				const isNoPower = await initBackEndControlRoutes();
				signInSuccess(isNoPower);
			}
		} else {
			ElMessage.error(res.message || '登录失败');
		}
	} catch (err) {
		ElMessage.error('登录请求失败，请检查网络');
	} finally {
		state.loading.signIn = false;
	}
};

const signInSuccess = (isNoPower: boolean | undefined) => {
	if (isNoPower) {
		ElMessage.warning('抱歉，您没有登录权限');
		Session.clear();
	} else {
		let currentTimeInfo = currentTime.value;
		if (route.query?.redirect) {
			router.push({
				path: <string>route.query?.redirect,
				query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
			});
		} else {
			router.push('/');
		}
		const signInText = t('message.signInText');
		ElMessage.success(`${currentTimeInfo}，${signInText}`);
		NextLoading.start();
	}
};
</script>

<style scoped lang="scss">
.login-form {
	.form-item {
		margin-bottom: 16px;
		.input-wrapper {
			position: relative;
			display: flex;
			align-items: center;
			.input-icon {
				position: absolute;
				left: 14px;
				font-size: 18px;
				color: #94a3b8;
				z-index: 1;
				pointer-events: none;
			}
			.form-input {
				width: 100%;
				padding: 11px 14px 11px 42px;
				border: 1px solid rgba(15,23,42,0.10);
				border-radius: 12px;
				font-size: 14px;
				outline: none;
				background: rgba(255,255,255,0.68);
				backdrop-filter: blur(6px);
				color: #2b2f36;
				font-family: inherit;
				transition: all 0.16s cubic-bezier(0.2,0.8,0.2,1);
				&:focus {
					border-color: rgba(24,160,88,0.38);
					box-shadow: 0 0 0 3px rgba(24,160,88,0.08);
					background: rgba(255,255,255,0.88);
				}
				&::placeholder {
					color: #94a3b8;
				}
			}
			.input-suffix {
				position: absolute;
				right: 14px;
				cursor: pointer;
				color: #94a3b8;
				font-size: 18px;
				display: flex;
				align-items: center;
				&:hover {
					color: #4b5563;
				}
			}
		}
	}
	.btn-submit {
		width: 100%;
		padding: 11px 0;
		font-size: 15px;
		font-weight: 700;
		border-radius: 12px;
		background: #111827;
		color: #fff;
		border: none;
		cursor: pointer;
		transition: all 0.16s cubic-bezier(0.2,0.8,0.2,1);
		font-family: inherit;
		margin-top: 6px;
		&:hover {
			background: #000;
			box-shadow: 0 10px 24px rgba(15,23,42,0.18);
		}
		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
		}
	}
}
</style>
