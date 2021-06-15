<template>
    <div class="bill">
        <span>账单列表</span>

        <el-divider></el-divider>

        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item label="账单时间：">
                <el-date-picker
                        v-model="searchForm.time"
                        type="month"
                        placeholder="选择月"
                        value-format="yyyy-MM">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="账单分类：">
                <el-select v-model="searchForm.category" placeholder="账单分类">
                    <el-option label="请选择" value=""></el-option>
                    <el-option v-for="category in categories" :key="category[0]" :label="category[2]"
                               :value="category[0]"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" plain @click="onSearch" icon="el-icon-search">查询</el-button>
            </el-form-item>
            <el-form-item>
                <span>收入合计：{{incomeCount}}￥，</span>
                <span>支出合计：{{expenseCount}}￥</span>
                <span v-for="item in monthlyCategoryExpenseArray" :key="item.category">
                    <span v-if="item.expenseCount != 0">，{{item.categoryName}}支出：{{item.expenseCount}}￥</span>
                </span>
            </el-form-item>
            <el-form-item class="add">
                <el-button type="primary" plain @click="onAdd" icon="el-icon-plus">添加记录</el-button>
            </el-form-item>
        </el-form>

        <div class="table-container">
            <el-table
                    :data="filteredTableData2"
                    border
                    style="width: 100%"
                    :row-class-name="tableRowClassName">
                <el-table-column
                        type="index"
                        label="序号"
                        width="50"
                        align="center">
                </el-table-column>
                <el-table-column
                        label="账单类型"
                        align="center">
                    <template slot-scope="scope">
                        <span>{{ typeFormat(scope.row[0]) }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                        label="账单时间"
                        align="center">
                    <template slot-scope="scope">
                        <span>{{ timeFormat(scope.row[1]) }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                        label="账单分类"
                        align="center">
                    <template slot-scope="scope">
                        <span>{{ categoryFormat(scope.row[2]) }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                        label="账单金额"
                        align="center">
                    <template slot-scope="scope">
                        <span>{{ amountFormat(scope.row[3]) }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog title="新增账单" :visible.sync="dialogFormVisible" center width="25%"
                   :close-on-click-modal="false" :close-on-press-escape="false">
            <el-form :model="dialogForm" :rules="rules" ref="dialogForm">
                <el-form-item label="账单类型：" :label-width="formLabelWidth" prop="type">
                    <el-select v-model="dialogForm.type" placeholder="账单分类">
                        <el-option v-for="type in typeOptions" :key="type.value" :label="type.label"
                                   :value="type.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="账单时间：" :label-width="formLabelWidth" prop="time">
                    <el-date-picker
                            v-model="dialogForm.time"
                            type="date"
                            placeholder="选择日"
                            format="yyyy-MM-dd"
                            value-format="timestamp">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="账单分类：" :label-width="formLabelWidth" prop="category">
                    <el-select v-model="dialogForm.category" placeholder="账单分类">
                        <el-option v-for="category in categories" :key="category[0]" :label="category[2]"
                                   :value="category[0]"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="账单金额：" :label-width="formLabelWidth" prop="amount">
                    <el-input-number v-model="dialogForm.amount" :precision="2" :step="0.01" :min="0"></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="doAdd('dialogForm')">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Papa from 'papaparse';
    import * as _ from 'lodash';
    import moment from 'moment';

    const TYPES = {INCOME: 1, EXPENSE: 0};

    export default {
        data() {
            return {
                searchForm: {
                    time: '',
                    category: ''
                },
                originTableData: [],
                filteredTableData: [],
                filteredTableData2: [],
                categories: [],
                incomeCount: 0,
                expenseCount: 0,
                dialogFormVisible: false,
                dialogForm: {
                    type: 1,
                    time: '',
                    category: '',
                    amount: 0
                },
                rules: {
                    type: [
                        {required: true, message: '请选择账单类型', trigger: 'blur'}
                    ],
                    time: [
                        {required: true, message: '请选择账单时间', trigger: 'blur'}
                    ],
                    category: [
                        {required: true, message: '请选择账单分类', trigger: 'blur'}
                    ],
                    amount: [
                        {required: true, message: '请选择账单金额', trigger: 'blur'}
                    ]
                },
                formLabelWidth: '120px',
                typeOptions: [{label: '收入', value: 1}, {label: '支出', value: 0}],
                monthlyCategoryExpenseArray: [],
            }
        },
        async mounted() {
            await this.loadCategories();

            await this.loadTable();
        },
        methods: {
            tableRowClassName({row}) {
                //设置收入和支出的不同样式
                if (row[0] == TYPES.INCOME) {
                    return 'income-row';
                } else if (row[0] == TYPES.EXPENSE) {
                    return 'expense-row';
                }
                return '';
            },
            typeFormat(value) {
                //账单类型转换
                if (!value && value != 0) {
                    return ''
                }
                return value == 1 ? '收入' : (value == 0 ? '支出' : '')
            },
            timeFormat(value) {
                //账单时间转换
                if (!value) {
                    return ''
                }
                return moment(parseInt(value)).utc().format('YYYY-MM-DD');
            },
            categoryFormat(value) {
                //账单分类转换
                if (!value) {
                    return ''
                }
                let categories = [...this.categories];
                return categories.find(item => {
                    return item[0] == value;
                })[2]
            },
            amountFormat(value) {
                //账单金额转换
                if (!value) {
                    return '0.00￥'
                }
                return parseFloat(value).toFixed(2) + '￥'
            },
            countTotal(data, type) {
                //统计总额
                if (!data) {
                    return 0;
                }
                if (data.length == 0) {
                    return 0;
                }
                let filteredArr = data.filter(item => {
                    return item[0] == type
                })
                let result = 0
                for (let i = 0; i < filteredArr.length; i++) {
                    result += parseFloat(filteredArr[i][3])
                }
                return parseFloat(result).toFixed(2)
            },
            async loadTable() {
                //加载列表数据
                let billCSV = await this.$http.get('/bill.csv');
                Papa.parse(billCSV, {
                    encoding: "ANSI",
                    complete: res => {
                        // UTF8 \r\n与\n混用时有可能会出问题
                        let data = res.data;
                        if (data[data.length - 1] == "") {
                            //去除最后的空行
                            data.pop();
                        }
                        this.originTableData = [...data];

                        let filteredTableData = [..._.slice(data, 1)];
                        this.filteredTableData = [...filteredTableData]
                        this.filteredTableData2 = [...filteredTableData]

                        this.incomeCount = this.countTotal(this.filteredTableData2, TYPES.INCOME)
                        this.expenseCount = this.countTotal(this.filteredTableData2, TYPES.EXPENSE)
                    }
                });
            },
            async loadCategories() {
                //加载账单分类数据
                let categoriesCSV = await this.$http.get('/categories.csv');
                Papa.parse(categoriesCSV, {
                    encoding: "ANSI",
                    complete: res => {
                        // UTF8 \r\n与\n混用时有可能会出问题
                        let data = res.data;
                        if (data[data.length - 1] == "") {
                            //去除最后的空行
                            data.pop();
                        }
                        this.categories = [..._.slice(data, 1)];
                    }
                });
            },
            onAdd() {
                //新增账单数据
                this.dialogFormVisible = true;
                this.$nextTick(() => {
                    //等弹窗DOM加载完再重置，否则会报错
                    this.resetForm('dialogForm');
                    //初始化表单数据
                    this.dialogForm.time = new Date().getTime()
                    if (this.categories && this.categories.length > 0) {
                        this.dialogForm.category = this.categories[0][0]
                    } else {
                        this.dialogForm.category = ''
                    }
                })
            },
            doAdd(formName) {
                //实际执行新增账单数据
                this.$refs[formName].validate((valid) => {
                    //校验表单数据
                    if (valid) {
                        let dialogForm = this.dialogForm
                        let array = [
                            dialogForm.type.toString(),
                            dialogForm.time,
                            dialogForm.category,
                            dialogForm.amount.toString()
                        ];
                        let filteredTableData = [...this.filteredTableData]
                        //将表单数据追加到初步过滤后的列表数据中
                        filteredTableData.push(array)

                        //将csv数组转换成json数据
                        let exportJSONArray = this.csv2json(filteredTableData);

                        //导出json数据到csv文件中
                        this.exportCsv(exportJSONArray);

                        this.$message({
                            message: '已提交',
                            type: 'success'
                        });
                    } else {
                        this.$message({
                            message: '请填完所有必填信息',
                            type: 'error'
                        });
                        return false;
                    }
                });
            },
            csv2json(exportArray) {
                //将csv数组转换成json数据
                let jsonArray = []
                exportArray.forEach(item => {
                    let obj = {}
                    obj.type = item[0]
                    obj.time = item[1]
                    obj.category = item[2]
                    obj.amount = item[3]
                    jsonArray.push(obj)
                })
                return jsonArray;
            },
            exportCsv(exportList) {
                //导出json数据到csv文件中
                let csv = Papa.unparse(exportList);
                //定义文件内容，类型必须为Blob 否则createObjectURL会报错
                let content = new Blob([csv]);
                //生成url对象
                let urlObject = window.URL || window.webkitURL || window;
                let url = urlObject.createObjectURL(content);
                //生成<a></a>DOM元素
                let el = document.createElement("a");
                //链接赋值
                el.href = url;
                el.download = "bill.csv";
                //必须点击否则不会下载
                el.click();
                //移除链接释放资源
                urlObject.revokeObjectURL(url);
            },
            resetForm(formName) {
                //清空表单中的数据
                this.$refs[formName].resetFields();
            },
            onSearch() {
                //先按账单时间和账单分类进行一次过滤
                this.filteredTableData2 = this.filteredTableData.filter(item => {
                    let timeFlag = true;
                    let categoryFlag = true;
                    if (this.searchForm.time) {
                        timeFlag = (this.timeFormat(item[1]).substring(0, 7) == this.searchForm.time);
                    }

                    if (this.searchForm.category) {
                        categoryFlag = (item[2] == this.searchForm.category);
                    }

                    return timeFlag && categoryFlag;
                })

                //再分组
                let filteredTableData2 = [...this.filteredTableData2]
                let groupedItems = _(filteredTableData2).groupBy(item => item[2]).map((items, item) => {
                    return {
                        category: item,
                        items: items
                    }
                }).value()

                //统计当前月份按分类分组的支出
                this.countDetail(groupedItems, TYPES.EXPENSE);

                //再排序
                groupedItems.sort((obj1, obj2) => {
                    let obj1sum = this.sum(obj1)
                    let obj2sum = this.sum(obj2)
                    if (obj1sum < obj2sum) {
                        // 按某种排序标准进行比较, a 小于 b
                        return -1;
                    }
                    if (obj1sum > obj2sum) {
                        return 1;
                    }
                    return 0;
                });

                //再转换回来用于显示
                let convertedItems = this.convertBack(groupedItems)
                this.filteredTableData2 = [...convertedItems]

                //统计收入和支出
                this.incomeCount = this.countTotal(this.filteredTableData2, TYPES.INCOME)
                this.expenseCount = this.countTotal(this.filteredTableData2, TYPES.EXPENSE)
            },
            sum(obj) {
                //将对象数组元素进行求和
                let items = obj.items
                let result = 0
                for (let i = 0; i < items.length; i++) {
                    result += parseFloat(items[i][3])
                }
                return result
            },
            convertBack(groupedItems) {
                //将分组后的数组转换回方便显示的形式
                let arr = []
                groupedItems.forEach(item => {
                    item.items.forEach(item2 => {
                        arr.push(item2)
                    })
                })
                return arr
            },
            countDetail(data, type) {
                //统计明细
                if (!data) {
                    this.monthlyCategoryExpenseArray = []
                    return;
                }
                if (data.length == 0) {
                    this.monthlyCategoryExpenseArray = []
                    return;
                }

                let monthlyCategoryExpenseArray = []
                data.forEach(item => {
                    //新增分类名称属性
                    item.categoryName = this.categoryFormat(item.category);
                    let items = item.items;
                    let expenseCount = 0
                    for (let i = 0; i < items.length; i++) {
                        if (items[i][0] == type) {
                            expenseCount += parseFloat(items[i][3])
                        }
                    }

                    //新增支出统计属性
                    item.expenseCount = parseFloat(expenseCount).toFixed(2);

                    monthlyCategoryExpenseArray.push(item)
                })

                this.monthlyCategoryExpenseArray = [...monthlyCategoryExpenseArray]
            },
        },
    }
</script>

<style>
    .el-table .income-row {
        background: rgb(240, 249, 235);
    }

    .el-table .expense-row {
        background: rgb(254, 240, 240);
    }

    .el-dialog .el-form-item > div > div {
        width: calc(100% - 40px);
    }
</style>

<style scoped>
    .bill .el-form {
        position: relative;
    }

    .bill .el-form .add {
        position: absolute;
        right: 0;
    }

    .bill .table-container {
        height: calc(100vh - 150px);
        overflow: auto;
    }
</style>