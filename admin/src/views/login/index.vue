<template>
	<div class="login-container">
		<div class="login-card">
			<div class="login-header">
				<div class="login-logo">
					<span class="logo-dot"></span>
					<span class="logo-text">账号商城</span>
				</div>
				<div class="login-title">后台管理</div>
				<div class="login-subtitle">专注、免费、开源、维护、解疑</div>
			</div>
			<div class="login-form-wrapper">
				<Account />
			</div>
		</div>
		<div class="login-footer">
			<span>© 2026 账号商城 · 后台管理系统</span>
		</div>
	</div>
</template>

<script setup lang="ts" name="loginIndex">
import { defineAsyncComponent, onMounted } from 'vue';
import { NextLoading } from '/@/utils/loading';

const Account = defineAsyncComponent(() => import('/@/views/login/component/account.vue'));

onMounted(() => {
	NextLoading.done();
});
</script>

<style scoped lang="scss">
.login-container {
	position: relative;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	background:
		radial-gradient(900px 700px at 10% 8%, rgba(24,160,88,0.14), transparent 58%),
		radial-gradient(900px 700px at 90% 10%, rgba(56,189,248,0.14), transparent 58%),
		radial-gradient(1000px 800px at 45% 96%, rgba(236,72,153,0.08), transparent 62%),
		linear-gradient(180deg, #f8fafc 0%, #eef2ff 46%, #f8fafc 100%);
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
	.login-card {
		position: relative;
		z-index: 1;
		width: 420px;
		background: rgba(255,255,255,0.82);
		backdrop-filter: blur(16px) saturate(160%);
		-webkit-backdrop-filter: blur(16px) saturate(160%);
		border: 1px solid rgba(15,23,42,0.10);
		border-radius: 18px;
		padding: 40px 36px 36px;
		box-shadow: 0 18px 55px rgba(15,23,42,0.16);
		animation: cardIn 0.4s cubic-bezier(0.2,0.8,0.2,1);
		.login-header {
			text-align: center;
			margin-bottom: 32px;
			.login-logo {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8px;
				margin-bottom: 8px;
				.logo-dot {
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background: #18a058;
					animation: pulse-dot 2s infinite;
				}
				.logo-text {
					font-size: 16px;
					font-weight: 800;
					color: #111827;
					letter-spacing: -0.3px;
				}
			}
			.login-title {
				font-size: 26px;
				font-weight: 800;
				color: #111827;
				letter-spacing: 2px;
			}
			.login-subtitle {
				font-size: 12px;
				color: #94a3b8;
				margin-top: 6px;
			}
		}
	}
	.login-footer {
		position: relative;
		z-index: 1;
		margin-top: 24px;
		font-size: 12px;
		color: #94a3b8;
	}
}
@keyframes cardIn {
	from { opacity: 0; transform: translateY(10px) scale(0.97); }
	to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes pulse-dot {
	0%,100% { opacity: 1; }
	50% { opacity: .35; }
}
</style>
