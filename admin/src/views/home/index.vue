<template>
	<div class="home-container layout-pd">
		<!-- 统计卡片 -->
		<el-row :gutter="15" class="home-card-one mb15">
			<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6" v-for="(v, k) in state.homeOne" :key="k">
				<div class="home-card-item flex">
					<div class="flex-margin flex w100" :class="`home-one-animation${k}`">
						<div class="flex-auto">
							<span class="font30">{{ v.num1 }}</span>
							<div class="mt10">{{ v.num3 }}</div>
						</div>
						<div class="home-card-item-icon flex" :style="{ background: `var(${v.color2})` }">
							<el-icon class="flex-margin font32" :style="{ color: `var(${v.color3})` }">
								<component :is="v.icon" />
							</el-icon>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>

		<!-- 图表区 -->
		<el-row :gutter="15" class="home-card-two mb15">
			<el-col :xs="24" :sm="14" :md="14" :lg="16" :xl="16">
				<div class="home-card-item">
					<div style="height: 100%" ref="homeLineRef"></div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="10" :md="10" :lg="8" :xl="8" class="home-media">
				<div class="home-card-item">
					<div style="height: 100%" ref="homePieRef"></div>
				</div>
			</el-col>
		</el-row>

		<!-- 快捷入口 + 柱状图 -->
		<el-row :gutter="15" class="home-card-three">
			<el-col :xs="24" :sm="10" :md="10" :lg="8" :xl="8">
				<div class="home-card-item">
					<div class="home-card-item-title">快捷入口</div>
					<div class="home-monitor">
						<div class="flex-warp">
							<div class="flex-warp-item" v-for="(v, k) in state.homeThree" :key="k">
								<div class="flex-warp-item-box" :class="`home-animation${k}`" @click="onNavClick(v.path)">
									<div class="flex-margin">
										<el-icon :style="{ color: v.iconColor }"><component :is="v.icon" /></el-icon>
										<span class="pl5">{{ v.label }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="14" :md="14" :lg="16" :xl="16" class="home-media">
				<div class="home-card-item">
					<div style="height: 100%" ref="homeBarRef"></div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script setup lang="ts" name="home">
import { reactive, onMounted, ref, watch, nextTick, onActivated, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useDashboardApi } from '/@/api/dashboard/index';

const router = useRouter();
const dashboardApi = useDashboardApi();
const homeLineRef = ref();
const homePieRef = ref();
const homeBarRef = ref();
const storesTagsViewRoutes = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { isTagsViewCurrenFull } = storeToRefs(storesTagsViewRoutes);

const state = reactive({
	global: {
		homeChartOne: null,
		homeChartTwo: null,
		homeCharThree: null,
		dispose: [null, '', undefined],
	} as any,
	homeOne: [
		{ num1: '0', num3: '累计订单数', icon: 'ele-ShoppingCart', color2: '--next-color-primary-lighter', color3: '--el-color-primary' },
		{ num1: '0', num3: '在售商品数量', icon: 'ele-Goods', color2: '--next-color-success-lighter', color3: '--el-color-success' },
		{ num1: '0', num3: '今日订单数', icon: 'ele-Document', color2: '--next-color-warning-lighter', color3: '--el-color-warning' },
		{ num1: '0', num3: '累计客户数', icon: 'ele-Clock', color2: '--next-color-danger-lighter', color3: '--el-color-danger' },
	],
	homeThree: [
		{ icon: 'ele-Goods', label: '商品管理', iconColor: '#F72B3F', path: '/business/product' },
		{ icon: 'ele-Document', label: '订单管理', iconColor: '#91BFF8', path: '/business/order' },
		{ icon: 'ele-Connection', label: '平台管理', iconColor: '#88D565', path: '/business/platform' },
		{ icon: 'ele-ChatLineSquare', label: '公告管理', iconColor: '#FBD4A0', path: '/business/announcement' },
		{ icon: 'ele-User', label: '客户管理', iconColor: '#E790E8', path: '/business/customer' },
		{ icon: 'ele-Setting', label: '系统配置', iconColor: '#36C78B', path: '/business/config' },
	],
	myCharts: [] as EmptyArrayType,
	charts: { theme: '', bgColor: '', color: '#303133' },
	statsData: null as any,
});

const onNavClick = (path: string) => {
	router.push(path);
};

const formatNum = (n: number | string): string => {
	const num = Number(n);
	if (num >= 10000) return (num / 10000).toFixed(1) + '万';
	return num.toLocaleString();
};

// 折线图：近30天订单趋势
const initLineChart = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.homeChartOne)) state.global.homeChartOne.dispose();
	state.global.homeChartOne = markRaw(echarts.init(homeLineRef.value, state.charts.theme));
	const data = state.statsData;
	const trend = data?.order_trend || [];
	const dates = trend.map((t: any) => t.date?.slice(5) || '');
	const counts = trend.map((t: any) => Number(t.count) || 0);
	const revenues = trend.map((t: any) => Number(t.revenue) || 0);
	const option = {
		backgroundColor: state.charts.bgColor,
		title: { text: '近7天订单趋势', x: 'left', textStyle: { fontSize: '15', color: state.charts.color } },
		grid: { top: 70, right: 20, bottom: 30, left: 30 },
		tooltip: { trigger: 'axis' },
		legend: { data: ['订单数', '成交金额(元)'], right: 0 },
		xAxis: { data: dates.length ? dates : ['暂无数据'] },
		yAxis: [
			{ type: 'value', name: '订单数', splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f5f5f5' } } },
			{ type: 'value', name: '金额', splitLine: { show: false } },
		],
		series: [
			{
				name: '订单数', type: 'line', symbolSize: 6, symbol: 'circle', smooth: true,
				data: counts,
				lineStyle: { color: '#fe9a8b' }, itemStyle: { color: '#fe9a8b' },
				areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#fe9a8bb3' }, { offset: 1, color: '#fe9a8b03' }]) },
			},
			{
				name: '成交金额(元)', type: 'line', yAxisIndex: 1, symbolSize: 6, symbol: 'circle', smooth: true,
				data: revenues,
				lineStyle: { color: '#9E87FF' }, itemStyle: { color: '#9E87FF' },
				areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#9E87FFb3' }, { offset: 1, color: '#9E87FF03' }]) },
			},
		],
	};
	state.global.homeChartOne.setOption(option);
	state.myCharts.push(state.global.homeChartOne);
};

// 饼图：平台商品分布
const initPieChart = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.homeChartTwo)) state.global.homeChartTwo.dispose();
	state.global.homeChartTwo = markRaw(echarts.init(homePieRef.value, state.charts.theme));
	const data = state.statsData;
	const platformStats = data?.platform_stats || [];
	const names = platformStats.map((p: any) => {
		const map: any = { douyin: '某音', kuaishou: '某手', shipinhao: '某视频号', xiaohongshu: '某红薯', baijiahao: '某百家号' };
		return map[p.platform] || p.platform;
	});
	const values = platformStats.map((p: any) => Number(p.count) || 0);
	const pieData = names.map((name: string, i: number) => ({ name, value: values[i] }));
	const colorList = ['#51A3FC', '#36C78B', '#FEC279', '#968AF5', '#E790E8'];
	const option = {
		backgroundColor: state.charts.bgColor,
		title: { text: '平台商品分布', x: 'left', textStyle: { fontSize: '15', color: state.charts.color } },
		tooltip: { trigger: 'item', formatter: '{b}: {c} 个 ({d}%)' },
		legend: { type: 'scroll', orient: 'vertical', right: '0%', left: '65%', top: 'center', itemWidth: 14, itemHeight: 14, data: names, textStyle: { rich: { name: { fontSize: 14, fontWeight: 400, width: 200, height: 35, padding: [0, 0, 0, 60], color: state.charts.color } } } },
		series: [{
			type: 'pie', radius: ['82', themeConfig.value.isIsDark ? '50' : '102'], center: ['32%', '50%'],
			itemStyle: { color: (params: any) => colorList[params.dataIndex] },
			label: { show: false }, labelLine: { show: false }, data: pieData.length ? pieData : [{ name: '暂无数据', value: 1 }],
		}],
	};
	state.global.homeChartTwo.setOption(option);
	state.myCharts.push(state.global.homeChartTwo);
};

// 柱状图：近7天收入
const initBarChart = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.homeCharThree)) state.global.homeCharThree.dispose();
	state.global.homeCharThree = markRaw(echarts.init(homeBarRef.value, state.charts.theme));
	const data = state.statsData;
	const trend = data?.order_trend || [];
	const dates = trend.map((t: any) => t.date?.slice(5) || '');
	const revenues = trend.map((t: any) => Number(t.revenue) || 0);
	const option = {
		backgroundColor: state.charts.bgColor,
		title: { text: '近7天收入趋势', x: 'left', textStyle: { fontSize: '15', color: state.charts.color } },
		tooltip: { trigger: 'axis' },
		legend: { data: ['收入(元)'], right: 0 },
		grid: { top: 70, right: 40, bottom: 30, left: 60 },
		xAxis: [{ type: 'category', data: dates.length ? dates : ['暂无数据'], boundaryGap: true, axisTick: { show: false } }],
		yAxis: [{ name: '收入(元)', nameLocation: 'middle', nameTextStyle: { padding: [3, 4, 50, 6] }, splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f5f5f5' } }, axisLine: { show: false }, axisTick: { show: false } }],
		series: [{
			name: '收入(元)', type: 'bar', barWidth: 30,
			itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(108,80,243,0.7)' }, { offset: 1, color: 'rgba(108,80,243,0.1)' }]), borderRadius: [30, 30, 0, 0] },
			data: revenues,
		}],
	};
	state.global.homeCharThree.setOption(option);
	state.myCharts.push(state.global.homeCharThree);
};

const refreshCharts = () => {
	nextTick(() => {
		setTimeout(() => initLineChart(), 100);
		setTimeout(() => initPieChart(), 300);
		setTimeout(() => initBarChart(), 500);
	});
};

const getStatsData = async () => {
	try {
		const res = await dashboardApi.stats();
		if (res.code === 0 && res.data) {
			state.statsData = res.data;
			const d = res.data;
			state.homeOne[0].num1 = formatNum(d.order_count || 0);
			state.homeOne[1].num1 = formatNum(d.product_count || 0);
			state.homeOne[2].num1 = String(d.today_orders || 0);
			state.homeOne[3].num1 = formatNum(d.customer_count || 0);
		}
	} catch { /* use defaults */ }
};

const initEchartsResizeFun = () => {
	nextTick(() => {
		for (let i = 0; i < state.myCharts.length; i++) {
			setTimeout(() => { state.myCharts[i].resize(); }, i * 500);
		}
	});
};
const initEchartsResize = () => { window.addEventListener('resize', initEchartsResizeFun); };

onMounted(async () => {
	initEchartsResize();
	await getStatsData();
	refreshCharts();
});
onActivated(() => { initEchartsResizeFun(); });

watch(() => isTagsViewCurrenFull.value, () => { initEchartsResizeFun(); });
watch(() => themeConfig.value.isIsDark, (isIsDark) => {
	nextTick(() => {
		state.charts.theme = isIsDark ? 'dark' : '';
		state.charts.bgColor = isIsDark ? 'transparent' : '';
		state.charts.color = isIsDark ? '#dadada' : '#303133';
		refreshCharts();
	});
}, { deep: true, immediate: true });
</script>

<style scoped lang="scss">
$homeNavLengh: 5;
.home-container {
	overflow: hidden;
	.home-card-one,
	.home-card-two,
	.home-card-three {
		.home-card-item {
			width: 100%;
			height: 130px;
			border-radius: 4px;
			transition: all ease 0.3s;
			padding: 20px;
			overflow: hidden;
			background: var(--el-color-white);
			color: var(--el-text-color-primary);
			border: 1px solid var(--next-border-color-light);
			&:hover {
				box-shadow: 0 2px 12px var(--next-color-dark-hover);
				transition: all ease 0.3s;
			}
			&-icon {
				width: 70px;
				height: 70px;
				border-radius: 100%;
				flex-shrink: 1;
				i { color: var(--el-text-color-placeholder); }
			}
			&-title {
				font-size: 15px;
				font-weight: bold;
				height: 30px;
			}
		}
	}
	.home-card-one {
		@for $i from 0 through 3 {
			.home-one-animation#{$i} {
				opacity: 0;
				animation-name: error-num;
				animation-duration: 0.5s;
				animation-fill-mode: forwards;
				animation-delay: calc($i/4) + s;
			}
		}
	}
	.home-card-two,
	.home-card-three {
		.home-card-item {
			height: 400px;
			width: 100%;
			overflow: hidden;
			.home-monitor {
				height: 100%;
				.flex-warp-item {
					width: 33.33%;
					height: 100px;
					display: flex;
					.flex-warp-item-box {
						margin: auto;
						text-align: center;
						color: var(--el-text-color-primary);
						display: flex;
						border-radius: 5px;
						background: var(--next-bg-color);
						cursor: pointer;
						transition: all 0.3s ease;
						&:hover {
							background: var(--el-color-primary-light-9);
							transition: all 0.3s ease;
						}
					}
					@for $i from 0 through $homeNavLengh {
						.home-animation#{$i} {
							opacity: 0;
							animation-name: error-num;
							animation-duration: 0.5s;
							animation-fill-mode: forwards;
							animation-delay: calc($i/10) + s;
						}
					}
				}
			}
		}
	}
}
</style>
