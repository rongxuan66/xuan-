import { defineStore } from 'pinia';
import { Session } from '/@/utils/storage';
import { useAuthApi } from '/@/api/auth/index';

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			userName: '',
			photo: '',
			time: 0,
			roles: [],
			authBtnList: [],
		},
	}),
	actions: {
		async setUserInfos() {
			// 存储用户信息到浏览器缓存
			if (Session.get('userInfo')) {
				this.userInfos = Session.get('userInfo');
			} else {
				const userInfos = <UserInfos>await this.getApiUserInfo();
				this.userInfos = userInfos;
			}
		},
		async getApiUserInfo() {
			return new Promise(async (resolve) => {
				try {
					const authApi = useAuthApi();
					const res = await authApi.info();
					if (res.code === 0 && res.data) {
						const userInfos = {
							userName: res.data.username,
							photo: res.data.avatar || '',
							time: new Date().getTime(),
							roles: [res.data.role || 'admin'],
							authBtnList: ['btn.add', 'btn.del', 'btn.edit', 'btn.link'],
						};
						Session.set('userInfo', userInfos);
						resolve(userInfos);
					} else {
						// fallback: use session cache
						const cached = Session.get('userInfo');
						resolve(cached || {
							userName: 'admin',
							photo: '',
							time: new Date().getTime(),
							roles: ['admin'],
							authBtnList: ['btn.add', 'btn.del', 'btn.edit', 'btn.link'],
						});
					}
				} catch {
					const cached = Session.get('userInfo');
					resolve(cached || {
						userName: 'admin',
						photo: '',
						time: new Date().getTime(),
						roles: ['admin'],
						authBtnList: ['btn.add', 'btn.del', 'btn.edit', 'btn.link'],
					});
				}
			});
		},
	},
});
