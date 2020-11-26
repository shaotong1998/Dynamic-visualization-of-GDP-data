
//引入csv文件b并自动转化格式
//用最基本方法解析

d3.csv('all.csv')
.then(function(datacsv){
    //console.log(data[0].country); 
    try{
        draw(datacsv);
    }catch(error)
    {
        alert(error);
    }

});            




$("#inputfile").change(function() {
    $("#inputfile").attr("hidden", true);
    var r = new FileReader();
    r.readAsText(this.files[0], "UTF-8");
    r.onload = function() {
      var data = d3.csvParse(this.result);
      try {
        draw(data);
      } catch (error) {
        alert(error);
      }
    };
  });



var data;       //所有的数据
var yearlist = [];  //用以存储所有的年份
var currentData = [];  //作为栈压入
var currentDateTop = [];
var pieDateset =[];
var bubbleDataset = [];
var tree =[];
var contextNum = 0;
var chart = config.chart;
var chinaGDP = [];
var chinaRank = [];
var chinaPro = [];
var cut = config.cut;  //用于显示的数目
var isChinabar = config.isChinabar;
var isCircle = config.isCircle;

//右下角方框内容
contextWidth = 500;
contextHeight = 800;  
//方框位置



var yheight = cut*50;


//设置画布
const margin = {
    left:250,
    right:150,
    top:180,
    bottom:100
};

const svg = d3.select("svg")
const width =svg.attr("width");
const height =svg.attr("height");

const innerWidth = width - margin.left - margin.right;

//设置比例尺
var xScale = d3.scaleLinear(); //竖向比例尺，用于确定延展
var yScale = d3.scaleBand();   //确定横条的位置，映射数据
//设置一个通用方法，用于简化代码
const yValue = d=>d.country;

const xValue = d=>Number(d.value);

const g = svg
        .append("g");


document.body.style.backgroundColor=config.bgcolor;


//定义坐标轴
//动态改变坐标轴位置
var cAxis = {
    long:"1000",   //定义一个固定基准 用于动态改变坐标轴的位置
    dylong:yheight+margin.top,   //动态的基准

    getLong:function(){
        if(cut<21){
            d3.select("svg").attr("height",2500);
            return this.long;
        }
        else
            return 50*cut;
    },
    getDylong:function(){
        //还需要动态的改变svg画布的长度
        if(cut>31)
            d3.select("svg").attr("height",cut*66);
        return this.dylong;
    }
}

const xZhou = g
    .append("g")
    .attr("transform", "translate(250, "+cAxis.getDylong()+"  )"    );//定义一个动态变化 250 890
    //.attr("transform", "translate(250, 1200)")//定义一个动态变化 250 890
    
xZhou
    .append("text")
    .attr("class","axis1")
    .attr("x",margin.left)
    .attr("y",margin.top)


//坐标轴属性，包括指向。以及要动态的改变坐标轴的长度
const xTicks = config.xTicks;//刻度的数量

const axis = d3
    .axisBottom()
    .scale(xScale)
    .ticks(xTicks)
    .tickPadding(20)
    //.tickSize(-100)  好像没什么变化
   // .tickFormat(d=> d+"美元") //比例尺格式化
    .tickSizeInner(-cAxis.getLong())


CY = cAxis.getDylong()+150;
contentX =  margin.left - 75;
contentY = CY; 



/**
 * 控制台数据记录区
 */

//得到某个元素的属性
//console.log(   d3.select("svg").attr("height")  )  




/**
 * 
 * 通用工具函数：
 *          改变坐标轴的位置
 *          获取颜色
 *          格式化数据
 *          将扁平的数据树状化
 * 
 */
function changeAxis(){
    if(cut<30){
        return 1200;
    }
    else
        return 2500;
}


//console.log(1200/cut);

//使用插值函数获得颜色
function getInterColor(d)
{
    var a = d3.rgb(255,1,1);  //大的
    var b = d3.rgb(255,255,0); //小的

    var compute = d3.interpolate(a,b)
    //只能操作0,1的数值

    var colorLinear = d3.scaleLinear()
        .domain([0,210])
        .range([0,6])

    return compute(colorLinear(d));
    
}


//自定义颜色+插值函数获得颜色
function getColor(d)
{
    //let color = d3.schemeCategory10;
    var a = d3.rgb(255,0,0);  
    var b = d3.rgb(255,255,0); 
    var compute = d3.interpolate(a,b)

    var colorLinear = d3.scaleLinear()
        .domain([0,cut])
        .range([0,1])
    
    if(d["country"] in config.color)
        return config.color[d["country"]];
    else
        return compute(colorLinear(d.rank));
}


//用于还原数据
function deformat(val, postfix) {
    return Number(val.replace(postfix, "").replace(/\,/g, ""));
  }
  





/***********************操作函数：负责进行图形的绘制****************** */
/**

一.对整体数据的处理"" 
                       1.提取出包含的年份，并进行排名
                       2.传递年份到下一级函数

二.往画布中添加一些描述性/常驻性的标签
        (创建一次，日后更新！！！)


*/
function draw(datacsv){

    data = datacsv;

    //把所有存在的年份提取出来，构成一个年份列表
    data.forEach(element => {
        if(yearlist.indexOf(element["time"])==-1 ){//-1为该数组中没有该名称
            yearlist.push(element["time"])
        }
    });
    //按照年份进行排名，所以应该对yearlist进行排名
    yearlist.sort()
    //console.log(yearlist)
    //******currentYear当前年份，用于显示！应该是排序后在表示
    currentYear = yearlist[0].toString();
    var time = yearlist;
    
    currentYear = time[0].toString();
    

    /**
     * 添加常驻物件，在次函数体内用于创建，随后个函数体内进行更新
     */
    yearLalel = g
        .insert("text")
        .data(currentYear)
        .attr("style:visibility",true)
        .attr("x",90)
        .attr("y",90)
        .attr("class","yearlable")
        .text(function(d){
            if(chart==1) return "各国GDP数据气泡图";
            if(chart==2)
                return "气泡图";
            else
                return currentYear+"年，全球前"+cut+"名国家/地区GDP排名";
        })

    if(chart == 0 && isChinabar==1){
    //定义一个矩形，用于显示当前的数据
        var context = g
            //.append("svg")
            .append("g")
            .attr("class","context")
            
           

        var contextRect = context
            //.attr("transform", "translate(0,-1000)")
            .append("rect")
            .attr("x",contentX)
            .attr("y",contentY)
            .attr("width",contextWidth)
            .attr("height",contextHeight)
            .attr("fill-opacity",1)

        var contextImage = context
            .append("image")
            .attr("x",contentX)  //图像水平向上到原点的距离  这个位置应该要可变！
            .attr("y",contentY+100)  
            .attr("xlink:href", "./country_flag/zhongguo.png")
            //.attr("fill-opacity",0.5)
            .attr("width",contextWidth)
            .attr("class","flag")

        gdpLabel = context
            .append("text")
            //.data(chinaGDP)
            .attr("x",contentX)  //图像水平向上到原点的距离  这个位置应该要可变！
            .attr("y",contentY+contextWidth) 
            .text(function(d){
                return currentYear+"年中国GDP："+chinaGDP+"美元";
            })
            .attr("fill","#FFFF00")
            .attr("class","chinaGDP")
  

        rankLabel = context
            .append("text")
            //.data(chinaGDP)
            .attr("x",contentX)  //图像水平向上到原点的距离  这个位置应该要可变！
            .attr("y",contentY+contextWidth+190) 
            .text(function(d){
                return "排名："+chinaRank;
            })
            .attr("fill","#FFFF00")
            .attr("class","chinaRank")

        proLabel = context
            .append("text")
            //.data(chinaGDP)
            .attr("x",contentX)  //图像水平向上到原点的距离  这个位置应该要可变！
            .attr("y",contentY+contextWidth+60) 
            .text(function(d){
                return "世界占比："+chinaPro;
            })
            .attr("fill","#FFFF00")
            .attr("class","chinaProp")
            
    }

    //从这里作为程序的入口，使用定时调用函数
    var i = 0;
    var t = 0;//记录毫秒数
    var interval = setInterval(function next()
    {
        //绘制动态排名的过程
        currentYear = time[i];
        getNow(time[i]);
        //动态的调用解释器 一般持续一年
        //console.log(config.startY["1963"])
        //console.log(config.timeArr[0]) 得到当前时间
        //removeExp();
        config.timeArr.forEach(
            function(e){
                if(currentYear==e){
                    drawExp();
                }
            }
        )
        i++;
        t = t+3000;
        // console.log(ti);
    },3000)

    $("#btnPause").click(function(){
        if(interval){
            clearInterval(interval);
            interval=null;
        }
    })
    $("#btnGo").click(function(){
        if(interval){
            clearInterval(interval);
            interval=null;
        }
        interval = setInterval(function next()
        {
            //绘制动态排名的过程
            currentYear = time[i];
            getNow(time[i]);
            config.timeArr.forEach(
                function(e){
                    if(currentYear==e){
                        drawExp();
                    }
                }
            )
            i++;
            t = t+3000;
            // console.log(ti);
        },3000)

    })


}



/**
 * @getNow
 * @time 为年份数据，如2018
 * 对确定年份数据执行操作
 * 
 * 一，加工数据，
 *           1.最重要的一步，根据得到的年份数据在所有的数据中提取当年的数据     
 *           //待改进：每次提取都会对整个数据进行遍历
 *           2.对得到数据的组进行切割，根据不同的绘制需求进行不同的切割
 * 
 * 二，使用数据   
 *           3.对全局数据的使用：label更新
 *                              设置比例尺
 *           4.调用数据绘制函数
 *                              
 */

function getNow(time){
  
    //var t = data[0].time;
    currentData = [];
    pieDateset = [];
    treeDataset = [];
    tree =[];
    //在整体数据data中提取出全部的time年的数据
    data.forEach(e=>{
        if(e["time"]==time)
        {
            currentData.push(e);
            tree.push(e);
        }
    })
 
/**
 * cut用于显示切割的数量---切太多不行，可能是比例尺的问题
 */
    currentData = currentData.slice(0,cut)
    currentDateTop = currentData.slice(0,5);//节省
    currentDateTop.forEach(e=>{
       
        proportion=e["proportion"].split("%")[0]
        pieDateset.push(Number(proportion));
        //console.log(e["proportion"])
    })
    //console.log(pieDateset)
    var otherCountry = 100;
    
    /*  饼状图数据处理
    for(i=0;i<pieDateset.length;i++)
    {
        otherCountry = otherCountry-pieDateset[i];
    }
    pieDateset.push(otherCountry.toFixed(4));
    */

    //根据数据确定比例尺

    xScale
        .domain([0,d3.max(currentData,xValue)])
        .range([0,innerWidth])
    
    //给条幅横向位置设置比例尺
    yScale
        .domain(currentData.map(d=>d.country))//map函数得到当前国家
        .range([0,yheight])   //实现国家名称和竖向的映射


    
    if(chart == 1){
        if(!currentYear){
            currentYear = 2018;
        }
        yearLalel
            .text("各国GDP数据气泡图");
        cut = 20;
        //treeDataset = toTree(tree);//tree为当年处理好的数据
        //drawCircle()

        drawCir.draw(tree,300,300);
        
    }
   

    if(chart == 0){
        if(!currentYear){
            currentYear = 2018;
        }
        yearLalel
                .text(currentYear+"年，全球前"+cut+"名国家/地区GDP排名(美元)");
        if(isChinabar ==1){
            
            gdpLabel
                .text(currentYear+"年中国GDP："+chinaGDP+"美元");
            rankLabel
                .text("排名："+chinaRank);
            proLabel
                .text("世界占比:"+chinaPro);
        }
        drawBar();
        change();

       
        if(isCircle==1){
            //d3.select("svg").attr("height",2500);

            drawCir.draw(tree,700,CY);    
        }
        //treeDataset = toTree(tree);
        //drawCircle(
    }
      
}



//定时调用的解释器。
function drawExp(){
//g的作用是选中svg并append一个g标签。

var ExpX=950;
var ExpY=450;
var ExpW=500;
var ExpH=600;
//首先应该select选中，如果有则修改，无则创建
     var context = g  
            .append("g")
            .attr("class","Exp")
            
            
   // var contextEnter = context
           // .transition()
           // .duration(3000)
           // .ease(d3.easeLinear)

    var contextRect = context
        //.attr("transform", "translate(0,-1000)")
       // .attr("width",50)
        //.attr("height",50)
        .append("rect")
        .attr("fill","#FAFAD2")
        //.transition()
       // .duration(900)
        //.ease(d3.easeLinear)
        .attr("x",950)
        .attr("y",450)
        .attr("width",500)
        .attr("height",600)
        //.attr("x",contentX-50)
        //.attr("y",contentY)
        //.attr("width",contextWidth)
        //.attr("height",contextHeight)
        .attr("fill-opacity",0.8)

    var contextText = context
        .append("text")
        .attr("fill-opacity",1)
        .attr("x",ExpX)
        .attr("y",ExpY+50)
        .attr("class","exp")
      /*    //直接在text标签内换行是否可行
            .text(function(d){
            //console.log(config.startY[currentYear].length )
            //由此可知，超过12个字符就要换行
            if (config.startY[currentYear].length<13){
                return config.startY[currentYear];
            }

            
            var tlength = config.startY[currentYear].length;

            //这里应该向下取整
            var looptime = Math.floor(tlength/12);
            var longCon = config.startY[currentYear];
            //console.log(longCon.substring(0,5));
            var start = 0;
            var end = 12;
            for(i=0;i<looptime;i++){
                //    
                ///document.write("<br>");
                return  longCon.substring(start,end)+"</br>"+"换行了";
            } 
            
            //console.log(config.startY[currentYear][0])
        })*/
    //给text添加多个子标签
    if (config.startY[currentYear].length<13){
        contextText
            .append("tspan")
            .text(config.startY[currentYear])
    }
    else{
    var tlength = config.startY[currentYear].length;
    var looptime = Math.floor(tlength/12);
   
    var longCon = config.startY[currentYear];
    var start = 0;
    var end = 12;
    var bais=0;
    //console.log(looptime)
    for(i=0;i<looptime+1;i++){
        //console.log("进入循环")
        contextText
            .append("tspan")
            .text(longCon.substring(start,end))
            .attr("y",ExpY+50+bais)
            .attr("x",ExpX)
        bais = bais + 50;
        start = start + 13;
        end = end + 13;
        }

    }

    //3000毫秒后正好退出
    var expExit = context
        .transition()
        .duration(3000)
        //.delay(1000)
        .ease(d3.easeLinear)

    expExit
        .select("rect")
        .remove()

    expExit
        .select("text")
        .remove()

    
}




function drawBar()
{
    
    if(currentData.length == 0)return;


    //需要对坐标轴长度进行动态的调整
    /*d3.selectAll("line")
    .attr("y1",-2300)
    .attr("y2",0)
    */
  

    //一、设置坐标轴
    xZhou
        .transition()
        .duration(3000)
        .ease(d3.easeLinear)
        //.ease(d3.easeCircle)
        .call(axis);   //将定义好的坐标放入画布



    //二、坐标轴的绘制
    var bar = g.selectAll(".bar")
        .data(currentData,function(d){
            return d.country;  
        })
        
        
        //定义每一个bar数据与姓名关联
        //！！！！！！！！！！按照键函数来排序，不是很明白  


    var barEnter = bar
            .enter()
            .insert("g")
            .attr("class","bar")           //这句话太重要了啊
            .attr("transform",function(d){//这个是相对的变化
               // return "translate(0,"+yScale(yValue(d))+")"
               return "translate(0,"+yScale(yValue(d))+")"
            });
            // console.log(barEnter.attr("transform"))
    
    barEnter
        .append("rect")
        .attr("width",0)
        .attr("height",26)
        .attr("y",50)
        .style("fill",function(d,i){return getColor(d)})
        .attr("fill-opacity",0.4)
        .on("mouseover",function(d){
            //颜色为什么改不了呢！！！
            d3.select(this)
                .attr("fill","#00FFFF")

            var neirong = g.append("g")
                .attr("class","neirong")
              

            neirong
                .append("rect")
                .attr("x",d3.mouse(this)["0"])
                .attr("y",yScale(yValue(d))+150)
                .attr("width",250)
                .attr("height",120)
                .attr("fill","#008B8B")
                .attr("fill-opacity",0.35)
            console.log("触发了事件"+d3.mouse(this))
            //console.log(d.country)
            var country = d.country;
            var proportion = d.proportion;
            var rank = d.rank;
            var time = d.time;
            var value = d.value;
            var zhou = d.zhou;
            neirong
                .append("text")
                .attr("x",d3.mouse(this)["0"])
                .attr("y",yScale(yValue(d))+160)
                .text(function(d){
                    return "时间:"+time;
                })
            neirong
                .append("text")
                .attr("x",d3.mouse(this)["0"])
                .attr("y",yScale(yValue(d))+180)
                .text(function(d){
                    return "国家:"+country;
                })
            neirong
                .append("text")
                .attr("x",d3.mouse(this)["0"])
                .attr("y",yScale(yValue(d))+200)
                .text(function(d){
                    return "所在洲:"+zhou;
                })
            neirong
                .append("text")
                .attr("x",d3.mouse(this)["0"])
                .attr("y",yScale(yValue(d))+220)
                .text(function(d){
                    return "当年GDP数据:"+value+"美元";
                })
            neirong
                .append("text")
                .attr("x",d3.mouse(this)["0"])
                .attr("y",yScale(yValue(d))+240)
                .text(function(d){
                    return "世界占比:"+proportion+"%";
                })
            neirong
                .append("text")
                .attr("x",d3.mouse(this)["0"])
                .attr("y",yScale(yValue(d))+260)
                .text(function(d){
                    return "当年排名:"+rank;
                })         
        })
        .on("mouseout",function(d)
        {
            d3.select(".neirong")
                .remove()
                
        })
        .transition("1")
        .delay(500)
        .duration(3000)
        .attr("y",margin.top)   //横轴到顶点的距离,
        .attr("x",margin.left)
        .attr("width",d=>xScale(xValue(d)).toFixed(2))
        //.attr("height",40)
        .attr("fill-opacity",1)
        //.on("mouseover",function(d){
           // console.log("有触发事件");
      //  })
        
        

    
    //添加bar右边数字，显示变化过程
    barEnter
        .append("text")
        .attr("x",d=>{
            return xScale(xValue(d)+500)})
        .attr("y",0)
        .attr("fill-opacity",0)
        .attr("fill",function(d,i){return getColor(d)})
        .transition()
        .duration(3000)
        .tween("text", function (d) {
            if(d.country=="中国"&&isChinabar ==1){
                chinaGDP = d.value;
                chinaRank = d.rank;
                chinaPro = d.proportion;
            }//只添加一次
       
            var self = this;
           
           //self为当前状态
           //刚开始入场时需要对入场的初始值做定义
            self.textContent = d.value * 0.8;
            //i为进入状态与目标状态的的插值
            var i = d3.interpolate(self.textContent, Number(d.value))
            //console.log(i(0)+"以及"+i(1));

            //prec = (Number(d.value) + "").split("."),
            prec = Number(d.value)
            //round = prec.length > 1 ? Math.pow(10, prec[1].length) : 1; 
            return function (t) {
              self.textContent = d3.format( ",.0f")(i(t)) ;
            
            };
           
          })
        .attr("fill-opacity",1)
        //.attr("y",margin.top)
        .attr("class",function(d){
            return "value";
        })
        .attr("x",d=>{
            return xScale(xValue(d))+270})
        .attr("y",margin.top+20)
        //.attr("text-anchor","end")
            

    //往bar上加一个国旗 
    barEnter
        .append("image")
        .attr("fill-opacity",0)
        .attr("y",50)
        .transition()
        .delay(500)
        .duration(3000)
        .attr("x",margin.left-40)  //图像水平向上到原点的距离  这个位置应该要可变！
        .attr("y",margin.top+1)  
        .attr("xlink:href",function(d){
            if(d.country=="刚果（金）"){
                return "./country_flag/gangguojin.png";
            }
            if(d.country=="刚果（布）"){
                return "./country_flag/gangguo.png";
            }

            str = pinyinUtil.getPinyin(d.country).replace(/\s*/g,"");
            /*if(str=="balici")
            {
                console.log(d.country);
            }*/
            return "./country_flag/"+str+".png";
        })
        .attr("fill-opacity",1)
        .attr("width",40)
        //.attr("class","flag")
        //.attr("filter:blur","3px")
        //.attr("height",function(){
            //  return 40
        //})
        


    //给bar的左边加个名字，国家名字
    barEnter
        .append("text")
        .attr("x",0)
        .attr("y",5)
        .attr("fill",function(d,i){return getColor(d)})
        .attr("font-size",30)
        .attr("fill-opacity",0)
        .attr("text-anchor","end")
        .transition()
        .delay(500)
        .duration(2500)
        .text(function(d){
            return d.country
        })
        .attr("x",margin.left-55)
        .attr("y",margin.top+22)
        .attr("fill-opacity",1)
        .attr("font-size",20)
        .attr("text-anchor","end")
        .attr("fill",function(d,i){return getColor(d)})
        

/**
 * 
 * Update
 * 
 * 
 */


    var barUpdate = bar
        .transition()
        .duration(3000)
        .ease(d3.easeLinear)
        //.ease(d3.easeQuad)
        
    barUpdate
        .select("rect")
        .style("fill",function(d,i){return getColor(d)})
        .attr("width",function(d){
                return xScale(xValue(d)).toFixed(2)       
        })


    barUpdate
        .select("text")
        .style("fill",function(d,i){return getColor(d)})



    barUpdate   ///和数值变化有关，非常重要！ 控制数字的变化和位置。
        .select(".value")
        .tween("text",function (d) {
            if(d.country=="中国"&& isChinabar ==1){
                if(d.time<=2018){
                chinaGDP = d.value;
                chinaRank = d.rank;
                chinaPro = d.proportion;
                }
            }
            var self = this;
            var i = d3.interpolate(deformat(self.textContent), Number(d.value))
            return function (t) {
              self.textContent = d3.format(",.0f")(
                Math.round(i(t))
              ) ;
              // d.value = self.textContent
            };
          })
        .duration(3000)
        .attr("x", d => xScale(xValue(d))+270);  //x为向下的位置


    //固定位置的数字条目更新
    var GDPUpdate = g.select(".chinaGDP")
        .transition()
        .duration(3000)
        //.attr(x,40)
 


        

/**
 * 
 * ********************Exit
 * 
 */  
    
    var barExit = bar
        .exit()
        .attr("fill-opacity",1)
        .transition()
        .duration(2000)   
        .ease(d3.easeLinear)

        

    barExit
       // .attr("transform",function(d){
            //console.log(typeof(d));  应当根据当前位置退出   位移退出不雅观
          //  return  "translate(0,"+yScale(yValue(d))+")"
            
       // })
        .remove()
        .attr("fill-opacity",0)

    barExit
        .select("rect")
        .attr("fill-opacity",function(d){
            //console.log("调用了exit"+d.country);
            return 0;
        })
        .attr("width",0)
        .attr("x",0)
        .remove()

    barExit
        .select("image")
        .attr("fill-opacity",0)
        .attr("width",0)
        .attr("x",0)
        .remove()

    barExit
        .selectAll("text")
        .attr("fill-opacity",0)
        .attr("width",0)
        .attr("x",0)
        .remove()

    }



//change函数用于把变化后的柱状图更新位置
    function change() {
        yScale
            .domain(currentData.map(d=>d.country))
            .range([0,yheight])

        g.selectAll(".bar")
            .data(currentData,function(d){
                return d.country;
            })
            .transition()
            .ease(d3.easeLinear)
            .duration(2000)
            .attr("transform",function(d)//d无名函数，代表绑定的数据
            {
                return "translate(0,"+yScale(yValue(d))+")"
            })
    } 




