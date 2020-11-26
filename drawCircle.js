//设置圆形之间的
var CirclePadding = 0;
var circleSize = 800;//设置整个圆形的大小


//将一个扁平的数据变成有结构的
function toTree(list){
    //console.log(list);
    let tree = {
        "zhou":"地球",
        "children":[
            {"zhou":"美洲","children":[]},
            {"zhou":"亚洲","children":[]},
            {"zhou":"欧洲","children":[]},
            {"zhou":"大洋洲","children":[]},
            {"zhou":"非洲","children":[]}
        ]

    }

    list.forEach(item=>{
        tree.children.forEach(element=>{
            if(item.zhou == element.zhou)
            {
                proportion=item["proportion"].split("%")[0]
                
                nu=Number(proportion).toFixed(4);
                item["proportion"]=Number(nu);
                //console.log(typeof(item["value"]))
                element.children.push(item);
            }
        })
       // console.log(tree.children)
    })
    
    return tree;
}



//匿名函数，作为对象去调用
var drawCir = 
{
    
    draw:function(data,x,y)
    {
        //这个ate是当个年份处理好的data
        var cDataset = toTree(data)

        let color = d3.schemeCategory10;
        var packLayout = d3.pack()
            .size([circleSize,circleSize])
            .padding(CirclePadding)

        //将layout应用到hierarchy，
        //必须先运行.sum()在hierarchy上，这个方法将遍历整棵树
        var root = d3.hierarchy(cDataset)

        root.sum(function(d){
            //console.log(d.value)
            return d.value;
        })


        packLayout(root) //packLout为每个node增加了xyr属性

        var nodes = g.selectAll(".node")
            .data(root.descendants(),function(d){    
            // console.log(typeof(d));   
                if(d.data.country)
                    return d.data.country;
                if(d.depth==1)
                    return  d.data.zhou;
            })

        //问题：绑定了国家，洲名就成了一个变化的量，所以每次变动都会重新创建并更新
        //不透明

        var nodesEnter = nodes
            .enter()
            .insert("g")
            .attr("class","node")  
            .attr("transform",function(d){     
                return "translate("+x+","+y+")"
            })
            .attr("fill-opacity",0)
            //
            //.attr('transform', function(d) {return 'translate(' + [d.x, d.y] + ')'})


        nodesEnter
            .append("circle")
            .attr("fill-opacity",0)
            .attr("transform",function(d){
                return "translate(-600,"+d3.select("svg").attr("height")+")"
            })
            .transition()
            .delay(500)
            .duration(3000)
            .attr("fill-opacity",function(d){
                if(d.depth==1){
                    return 1;
                }
                if(d.depth==0){
                    return 0.2;
                }
                else
                    return 1;
            })
            .attr("r",function(d){
                
                return d.r;
            })
            .attr("fill",function(d,i){
                if(d.depth==0){
                    return "#0000FF"
                }
                if(d.depth==1){
                    return color[i];
                }
                //return color[i];
                //console.log(d.data.rank)
                return getInterColor(d.data.rank);

            })


        nodesEnter
            .append("text")
            .attr("transform",function(d){
                return "translate("+d3.select("svg").attr("weight")/2+","+d3.select("svg").attr("height")+")"
            })
            .attr("fill-opacity",0)
            .transition()
            .delay(500)
            .duration(3000) 
            .attr("fill-opacity",1)
            .attr("font-size",function(d){
                return d.r/2;
            })
            //需要调整字的位置  //一班的为-20
            .attr("dy",0)
            .attr("dx",function(d){
                if(d.r>20)
                    return -30;
                if(d.r>15&&d.r<20){
                    return -15;
                }
                else
                    return -5;
            })
            .text(function(d){
            //  if(d.r<5){
            //     return "";
            // }
            /* if(d.data.country=="挪威")
                {                               挪威的大小为17！
                    console.log(d.r);
                }*/
                return d.children ===undefined?d.data.country:"";
            })
        

        //更新数据
        var circleUpdate = nodes
            .transition()
            .duration(3000)
            .ease(d3.easeLinear)

        circleUpdate
            .select("circle")
            .attr("r",function(d){
                //console.log(d.r);
                return d.r;
            })
            .attr('transform', function(d) {return 'translate(' + [d.x, d.y] + ')'})



        circleUpdate
            .select("text")
            .attr("fill","#FFFFFF")
            .attr('transform', function(d) {return 'translate(' + [d.x, d.y] + ')'})
            .attr("font-size",function(d){
                return d.r/2;
            })
          /*  .attr({
                x: function(d) { arc.outerRadius(d.r); return arc.centroid(d)[0]; },
                y: function(d) { arc.outerRadius(d.r); return arc.centroid(d)[1]; }
            })*/

    
        //数据退出
        var circleExit = nodes
            .exit()
            .attr("fill-opacity",1)
            .transition()
            .duration(2000)

        circleExit
            .attr("transform",function(d){
                return "translate(0," + "1000" + ")";
            })
            .remove()
            .attr("fill-opacity",0)
    },
   
    con:function(){
        console.log("测试")
    },


    drawDycircle:function(data){
        var cDataset = toTree(data);
        console.log(cDataset);
    }
    


}