const config = {

//用于自定义柱状图的颜色
color:
{
    "中国":"#FF0000",
    "美国":"#0000CD",
    "日本":"#FF1493",
    "法国":"#00FF00"
},
//背景颜色
bgcolor:"#C1FFC1",

//用于显示的数目
//大于100会出现地图显示不全
//最好20-100
cut:20,


//定义坐标轴竖条的数目
xTicks:5,

//是否显示中国当前状态 1为显示 0监视世界事件
isChinabar:1,

//是否在柱状图中展示气泡图 1为展示
isCircle:1,

//设置一个选取图表的函数
/**
 * 0为动态排名柱状图
 * 1为各国GDP数据气泡图
 * 
 */
chart:0,


timeArr:[1963,1966,1969,1972],
startY:{1963:"1963年中苏公开论战、美国黑人民权运动兴起、肯尼迪遇刺等事件震动世界。",
        1966:"中国导弹核武器试验成功。",
        1969:"宇航员阿姆斯特朗完成人类首次登月。",
        1972:"1972年，美国总统尼克松访华、水门事件、第20届奥运会召开和慕尼黑“黑九月事件”、中日邦交正常化等等。",
        //1962:"你好"

       
        },



}

