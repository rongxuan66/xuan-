/**
 * views personal
 */
type NewInfo = {
	title: string;
	date: string;
	link: string;
};
type Recommend = {
	title: string;
	msg: string;
	icon: string;
	bg: string;
	iconColor: string;
};
declare type PersonalState = {
	newsInfoList: NewInfo[];
	recommendList: Recommend[];
	personalForm: {
		name: string;
		email: string;
		autograph: string;
		occupation: string;
		phone: string;
		sex: string;
	};
};

/**
 * views visualizing
 */
declare type Demo2State<T = any> = {
	time: {
		txt: string;
		fun: number;
	};
	dropdownList: T[];
	dropdownActive: string;
	skyList: T[];
	dBtnList: T[];
	chartData4Index: number;
	dBtnActive: number;
	earth3DBtnList: T[];
	chartData4List: T[];
	myCharts: T[];
};

/**
 * views params
 */
declare type ParamsState = {
	value: string;
	tagsViewName: string;
	tagsViewNameIsI18n: boolean;
};

/**
 * views system
 */
// role
declare interface RowRoleType {
	roleName: string;
	roleSign: string;
	describe: string;
	sort: number;
	status: boolean;
	createTime: string;
}

interface SysRoleTableType extends TableType {
	data: RowRoleType[];
}

declare interface SysRoleState {
	tableData: SysRoleTableType;
}

declare type TreeType = {
	id: number;
	label: string;
	children?: TreeType[];
};

// user
declare type RowUserType<T = any> = {
	userName: string;
	userNickname: string;
	roleSign: string;
	department: string[];
	phone: string;
	email: string;
	sex: string;
	password: string;
	overdueTime: T;
	status: boolean;
	describe: string;
	createTime: T;
};

interface SysUserTableType extends TableType {
	data: RowUserType[];
}

declare interface SysUserState {
	tableData: SysUserTableType;
}

declare type DeptTreeType = {
	deptName: string;
	createTime: string;
	status: boolean;
	sort: number;
	describe: string;
	id: number | string;
	children?: DeptTreeType[];
};

// dept
declare interface RowDeptType extends DeptTreeType {
	deptLevel: string[];
	person: string;
	phone: string;
	email: string;
}

interface SysDeptTableType extends TableType {
	data: DeptTreeType[];
}

declare interface SysDeptState {
	tableData: SysDeptTableType;
}

// dic
type ListType = {
	id: number;
	label: string;
	value: string;
};

declare interface RowDicType {
	dicName: string;
	fieldName: string;
	describe: string;
	status: boolean;
	createTime: string;
	list: ListType[];
}

interface SysDicTableType extends TableType {
	data: RowDicType[];
}

declare interface SysDicState {
	tableData: SysDicTableType;
}

/**
 * views pages
 */
//  filtering
declare type FilteringChilType = {
	id: number | string;
	label: string;
	active: boolean;
};

declare type FilterListType = {
	img: string;
	title: string;
	evaluate: string;
	collection: string;
	price: string;
	monSales: string;
	id: number | string;
	loading?: boolean;
};

declare type FilteringRowType = {
	title: string;
	isMore: boolean;
	isShowMore: boolean;
	id: number | string;
	children: FilteringChilType[];
};

// tableRules
declare type TableRulesHeaderType = {
	prop: string;
	width: string | number;
	label: string;
	isRequired?: boolean;
	isTooltip?: boolean;
	type: string;
};

declare type TableRulesState = {
	tableData: {
		data: EmptyObjectType[];
		header: TableRulesHeaderType[];
		option: SelectOptionType[];
	};
};

declare type TableRulesOneProps = {
	name: string;
	email: string;
	autograph: string;
	occupation: string;
};

// tree
declare type RowTreeType = {
	id: number;
	label: string;
	label1: string;
	label2: string;
	isShow: boolean;
	children?: RowTreeType[];
};

// workflow index
declare type NodeListState = {
	id: string | number;
	nodeId: string | undefined;
	class: HTMLElement | string;
	left: number | string;
	top: number | string;
	icon: string;
	name: string;
};

declare type LineListState = {
	sourceId: string;
	targetId: string;
	label: string;
};

declare type XyState = {
	x: string | number;
	y: string | number;
};

declare type WorkflowState<T = any> = {
	leftNavList: T[];
	dropdownNode: XyState;
	dropdownLine: XyState;
	isShow: boolean;
	jsPlumb: T;
	jsPlumbNodeIndex: null | number;
	jsplumbDefaults: T;
	jsplumbMakeSource: T;
	jsplumbMakeTarget: T;
	jsplumbConnect: T;
	jsplumbData: {
		nodeList: NodeListState[];
		lineList: LineListState[];
	};
};

// workflow drawer
declare type WorkflowDrawerNodeState<T = any> = {
	node: { [key: string]: T };
	nodeRules: T;
	form: T;
	tabsActive: string;
	loading: {
		extend: boolean;
	};
};

declare type WorkflowDrawerLabelType = {
	type: string;
	label: string;
};

declare type WorkflowDrawerState<T = any> = {
	isOpen: boolean;
	nodeData: {
		type: string;
	};
	jsplumbConn: T;
};

/**
 * views product (商品管理)
 */
declare interface RowProductType {
	id: number;
	title: string;
	platform: string;
	category: string;
	images: string[];
	price: number;
	original_price: number;
	stock: number;
	followers: number;
	likes: number;
	favorites: number;
	gender: string;
	gender_male_ratio: number;
	gender_female_ratio: number;
	is_verified: number;
	description: string;
	usage_guide: string;
	status: number;
	created_at: string;
	updated_at: string;
}

interface SysProductTableType extends TableType {
	data: RowProductType[];
}

declare interface SysProductState {
	tableData: SysProductTableType;
}

// order (订单管理)
declare interface RowOrderType {
	id: number;
	order_no: string;
	product_id: number;
	product_title: string;
	product_image: string;
	price: number;
	phone: string;
	pay_method: string;
	status: string;
	account: string;
	password: string;
	paid_at: string;
	created_at: string;
}

interface SysOrderTableType extends TableType {
	data: RowOrderType[];
}

declare interface SysOrderState {
	tableData: SysOrderTableType;
}

// platform (平台管理)
declare interface RowPlatformType {
	id: number;
	platform_key: string;
	name: string;
	icon: string;
	color: string;
	sort_order: number;
	status: number;
	created_at: string;
}

interface SysPlatformTableType extends TableType {
	data: RowPlatformType[];
}

declare interface SysPlatformState {
	tableData: SysPlatformTableType;
}

// announcement (公告管理)
declare interface RowAnnouncementType {
	id: number;
	content: string;
	sort_order: number;
	status: number;
	created_at: string;
}

interface SysAnnouncementTableType extends TableType {
	data: RowAnnouncementType[];
}

declare interface SysAnnouncementState {
	tableData: SysAnnouncementTableType;
}

// customer (客户管理)
declare interface RowCustomerType {
	id: number;
	phone: string;
	total_orders: number;
	total_amount: number;
	first_order_at: string;
	last_order_at: string;
}

interface SysCustomerTableType extends TableType {
	data: RowCustomerType[];
}

declare interface SysCustomerState {
	tableData: SysCustomerTableType;
}

/**
 * views payment (支付管理)
 */
// payment config (支付配置)
declare interface RowPayConfigType {
	id: number;
	api_url: string;
	pid: string;
	key: string;
	notify_url: string;
	return_url: string;
	pay_types: string[];
	status: number;
	created_at: string;
	updated_at: string;
}

declare interface SysPayConfigState {
	ruleForm: RowPayConfigType;
	testLoading: boolean;
	saveLoading: boolean;
}

// payment record (交易记录)
declare interface RowPayRecordType {
	id: number;
	trade_no: string;
	out_trade_no: string;
	name: string;
	money: number;
	type: string;
	status: string;
	param: string;
	paid_at: string;
	created_at: string;
}

interface SysPayRecordTableType extends TableType {
	data: RowPayRecordType[];
}

declare interface SysPayRecordState {
	tableData: SysPayRecordTableType;
}

/**
 * views make
 */
// tableDemo
declare type TableDemoPageType = {
	pageNum: number;
	pageSize: number;
};

declare type TableHeaderType = {
	key: string;
	width: string;
	title: string;
	type: string | number;
	colWidth: string;
	width?: string | number;
	height?: string | number;
	isCheck: boolean;
};

declare type TableSearchType = {
	label: string;
	prop: string;
	placeholder: string;
	required: boolean;
	type: string;
	options?: SelectOptionType[];
};

declare type TableDemoState = {
	tableData: {
		data: EmptyObjectType[];
		header: TableHeaderType[];
		config: {
			total: number;
			loading: boolean;
			isBorder: boolean;
			isSelection: boolean;
			isSerialNo: boolean;
			isOperate: boolean;
		};
		search: TableSearchType[];
		param: EmptyObjectType;
		printName: string;
	};
};
