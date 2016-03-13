(function gloabal_distribution(){
    if(myBrowser()==="Safari"||myBrowser()==="IE"){
        setTimeout(function(){
        	alert("您的浏览器不支持WebGL技术,部分效果不体验不佳,请换用firefox或者chrome,");
        	//准备截张图片
        },2000)
        return;
    }
    var globe = DAT.Globe(document.getElementById('global_Container'), {
        colorFn: function(label) {
            return new THREE.Color([
                0xd9d9d9, 0xb6b4b5, 0x9966cc, 0x15adff, 0x3e66a3,
                0x216288, 0xff7e7e, 0xff1f13, 0xc0120b, 0x5a1301, 0xffcc02,
                0xedb113, 0x9fce66, 0x0c9a39,
                0xfe9872, 0x7f3f98, 0xf26522, 0x2bb673, 0xd7df23,
                0xe6b23a, 0x7ed3f7
            ][label]);
        }
    });

    var xhr = new XMLHttpRequest();
    xhr.open('GET', './data/global.json', true);
    xhr.onreadystatechange = function(e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                globe.addData(data, {
                    format: 'legend'
                });
                globe.createPoints();
                globe.animate();
            }
        }
    };
    xhr.send(null);
})();

(function d3_render(){
	var d3Render={
			d3Map:function (){
				function tooltipHtml(n, d){	/* function to create html content string in tooltip div. */
					return "<h4>"+n+"</h4><table>"+
						"<tr><td>Low</td><td>"+(d.low)+"</td></tr>"+
						"<tr><td>Average</td><td>"+(d.avg)+"</td></tr>"+
						"<tr><td>High</td><td>"+(d.high)+"</td></tr>"+
						"</table>";
				}
				var sampleData ={};	/* Sample data */	
				['JXI', 'LIA', 'TIB', 'NMG', 'SHH', 'CHQ', 'XIN', 'SHD', 'HEN', 'GUD', 'GUI', 'BEJ', 'MAC', 'TAJ', 'HLJ', 'HEB', 'ZHJ', 'ANH', 'GXI', 'HAI', 'JIL', 'SHX', 'HUN', 'YUN', 'FUJ', 'HUB', 'SHA', 'HKG', 'QIH', 'GAN', 'JSU', 'SCH', 'NXA', 'TAI']
					.forEach(function(d){ 
						var low=Math.round(100*Math.random()), 
							mid=Math.round(100*Math.random()), 
							high=Math.round(100*Math.random());
						sampleData[d]={low:d3.min([low,mid,high]), high:d3.max([low,mid,high]), 
								avg:Math.round((low+mid+high)/3), color:d3.interpolate("#007eff", "#333333")(low/100)}; 
					});
				d3.json("./data/chinaMap.json",function(data){
					var uStatePaths=data;
				    var svg = d3.select("#d3MapWrap") 
				            .append("svg") 
				            .attr("id","d3MapSVG")
				            .attr("width",600) 
				            .attr("height",470)
				            .attr("text-align","left");
			        var uStates = {};
			 	    uStates.draw = function(id, data, toolTip) {
						function mouseOver(d) {
							d3.select("#tooltip_d3map").transition().duration(200).style("opacity", .9);

							d3.select("#tooltip_d3map").html(toolTip(d.n, data[d.id]))
								.style("left", (d3.event.pageX) + "px")
								.style("top", (d3.event.pageY-100) + "px");
						}

						function mouseOut() {
							d3.select("#tooltip_d3map").transition().duration(500).style("opacity", 0);
						}

						function click(d){
							var id=d.id;
							var _path=d3.select("path#"+id);
							_path.style("fill",function(d){
								if(_path.attr("active")==="true"){
									_path.attr("active","false")
									return data[d.id].color;
								}else{
									_path.attr("active","true")
									return "yellow"
								}
							});
							console.log(d);
							var timeDOM=document.querySelector("#d3map-time-select");
							var month=timeDOM.value;
							// d3Render.barchartUpdate(d.aQLevel[(month-1)])
						}

						d3.select(id).selectAll(".state")
							.data(uStatePaths).enter().append("path").attr("class", "state").attr("id",function(d){
								return d.id;
							}).attr("d", function(d) {
								return d.d;
							})
							.style("fill", function(d) {
								return data[d.id].color;
							}).style("cursor","pointer")
							.on("mouseover", mouseOver).on("mouseout", mouseOut)
							.on("click",click);

					}
					/* draw states on id #d3MapSVG */	
					uStates.draw("#d3MapSVG", sampleData, tooltipHtml);
				})
			},
			pieChartUpdate:function(data){
				// var data = [];

			 //    data = d3.range(numberOfDataPoint).map(function (i) {
			 //        return {id: i, value: randomData()};
			 //    });

			    var chart = d3Render.pieChart()
			            .radius(130)
			            .innerRadius(50)
			            .data(data);

			    chart.render();
			},
			pieChart:function(){
			        var _chart = {};

			        var _width = 260, _height = 260,
			                _data = [],
			                _colors = d3.scale.category20(),
			                _svg,
			                _bodyG,
			                _pieG,
			                _radius = 90,
			                _innerRadius = 0;

			        _chart.render = function () {
			            if (!_svg) {
			                _svg = d3.select("#key_PollutantWrap").append("svg")
			                        .attr("height", _height)
			                        .attr("width", _width);
			            }

			            renderBody(_svg);
			        };

			        function renderBody(svg) {
			            if (!_bodyG)
			                _bodyG = svg.append("g")
			                        .attr("class", "body");

			            renderPie();
			        }

			        function renderPie() {
			            var pie = d3.layout.pie() // <-A
			                    .sort(function (d) {
			                        return d.id;
			                    })
			                    .value(function (d) {
			                        return d.value;
			                    });

			            var arc = d3.svg.arc()
			                    .outerRadius(_radius)
			                    .innerRadius(_innerRadius);

			            if (!_pieG)
			                _pieG = _bodyG.append("g")
			                        .attr("class", "pie")
			                        .attr("transform", "translate(" 
			                            + _radius 
			                            + "," 
			                            + _radius + ")");

			            renderSlices(pie, arc);

			            renderLabels(pie, arc);
			        }

			        function renderSlices(pie, arc) {
			            var slices = _pieG.selectAll("path.arc")
			                    .data(pie(_data)); // <-B

			            slices.enter()
			                    .append("path")
			                    .attr("class", "arc")
			                    .attr("fill", function (d, i) {
			                        return _colors(i);
			                    });

			            slices.transition()
			                    .attrTween("d", function (d) {
			                        var currentArc = this.__current__; // <-C

			                        if (!currentArc)
			                            currentArc = {startAngle: 0, 
			                                            endAngle: 0};

			                        var interpolate = d3.interpolate(
			                                            currentArc, d);
			                                            
			                        this.__current__ = interpolate(1);//<-D
			                        
			                        return function (t) {
			                            return arc(interpolate(t));
			                        };
			                    });
			        }

			        function renderLabels(pie, arc) {
			            var labels = _pieG.selectAll("text.label")
			                    .data(pie(_data)); // <-E

			            labels.enter()
			                    .append("text")
			                    .attr("class", "label");

			            labels.transition()
			                    .attr("transform", function (d) {
			                        return "translate(" 
			                            + arc.centroid(d) + ")"; // <-F
			                    })
			                    .attr("dy", ".35em")
			                    .attr("text-anchor", "middle")
			                    .text(function (d) {
			                        return d.data.id;
			                    });
			        }

			        _chart.width = function (w) {
			            if (!arguments.length) return _width;
			            _width = w;
			            return _chart;
			        };

			        _chart.height = function (h) {
			            if (!arguments.length) return _height;
			            _height = h;
			            return _chart;
			        };

			        _chart.colors = function (c) {
			            if (!arguments.length) return _colors;
			            _colors = c;
			            return _chart;
			        };

			        _chart.radius = function (r) {
			            if (!arguments.length) return _radius;
			            _radius = r;
			            return _chart;
			        };

			        _chart.innerRadius = function (r) {
			            if (!arguments.length) return _innerRadius;
			            _innerRadius = r;
			            return _chart;
			        };

			        _chart.data = function (d) {
			            if (!arguments.length) return _data;
			            _data = d;
			            return _chart;
			        };

			        return _chart;
			},
			barchartUpdate:function(data){
				// [{x:0,y:5},{x:2,y:6},{x:4,y:9},{x:6,y:10},{x:8,y:0},{x:10,y:0}]
			    
				var chart = d3Render.barChart()
				        .x(d3.scale.linear().domain([0, 12]))
				        .y(d3.scale.linear().domain([0, 10]));


				chart.setSeries(data);

				chart.render();
			},
			barChart:function(){
				    var _chart = {};

				    var _width = 500, _height = 200,
				            _margins = {top: 30, left: 30, right: 30, bottom: 30},
				            _x, _y,
				            _data = [],
				            _colors = d3.scale.category10(),
				            _svg,
				            _bodyG;

				    _chart.render = function () {
				        if (!_svg) {
				            _svg = d3.select("#airQualityLevelWrap").append("svg")
				                    .attr("height", _height)
				                    .attr("width", _width);

				            renderAxes(_svg);

				            defineBodyClip(_svg);
				        }

				        renderBody(_svg);
				    };

				    function renderAxes(svg) {
				        var axesG = svg.append("g")
				                .attr("class", "axes");
				        var arr_title=["优","良","轻度污染","中度污染","重度污染","严重污染"];
				        var xAxis = d3.svg.axis()
				                .scale(_x.range([0, quadrantWidth()]))
				                .orient("bottom")
				                .tickFormat(function(d,i){
				                	if(i%2===1){
				                		var a=(i-1)/2;
				                		return arr_title[a];
				                	}else{
				                		return "";
				                	}
				                });

				        var yAxis = d3.svg.axis()
				                .scale(_y.range([quadrantHeight(), 0]))
				                .orient("left");

				        axesG.append("g")
				                .attr("class", "axis")
				                .attr("transform", function () {
				                    return "translate(" + xStart() + "," + yStart() + ")";
				                })
				                .call(xAxis);

				        axesG.append("g")
				                .attr("class", "axis")
				                .attr("transform", function () {
				                    return "translate(" + xStart() + "," + yEnd() + ")";
				                })
				                .call(yAxis);
				    }

				    function defineBodyClip(svg) {
				        var padding = 0;

				        svg.append("defs")
				                .append("clipPath")
				                .attr("id", "body-clip")
				                .append("rect")
				                .attr("x", 0)
				                .attr("y", 0)
				                .attr("width", quadrantWidth() + 2 * padding)
				                .attr("height", quadrantHeight());
				    }

				    function renderBody(svg) {
				        if (!_bodyG)
				            _bodyG = svg.append("g")
				                    .attr("class", "body")
				                    .attr("transform", "translate(" 
				                            + xStart() 
				                            + "," 
				                            + yEnd() + ")")
				                    .attr("clip-path", "url(#body-clip)");

				        renderBars();
				    }
				    
				    function renderBars() {
				        var padding =10; // <-A
				        
				        _bodyG.selectAll("rect.bar")
				                    .data(_data)
				                .enter()
				                .append("rect") // <-B
				                .attr("class", "bar")
				                .attr("transform","translate("+padding+",0)");

				        _bodyG.selectAll("rect.bar")
				                    .data(_data)                    
				                .transition()
				                .attr("x", function (d) { 
				                    return _x(d.x); // <-C
				                })
				                .attr("y", function (d) { 
				                    return _y(d.y); // <-D 
				                })
				                .attr("height", function (d) { 
				                    return yStart() - _y(d.y); 
				                })
				                .attr("width", function(d){
				                	var  length=_data.length;
				                    return Math.floor((quadrantWidth()-(length+1) * padding)/ length);
				                });
				    }

				    function xStart() {
				        return _margins.left;
				    }

				    function yStart() {
				        return _height - _margins.bottom;
				    }

				    function xEnd() {
				        return _width - _margins.right;
				    }

				    function yEnd() {
				        return _margins.top;
				    }

				    function quadrantWidth() {
				        return _width - _margins.left - _margins.right;
				    }

				    function quadrantHeight() {
				        return _height - _margins.top - _margins.bottom;
				    }

				    _chart.width = function (w) {
				        if (!arguments.length) return _width;
				        _width = w;
				        return _chart;
				    };

				    _chart.height = function (h) {
				        if (!arguments.length) return _height;
				        _height = h;
				        return _chart;
				    };

				    _chart.margins = function (m) {
				        if (!arguments.length) return _margins;
				        _margins = m;
				        return _chart;
				    };

				    _chart.colors = function (c) {
				        if (!arguments.length) return _colors;
				        _colors = c;
				        return _chart;
				    };

				    _chart.x = function (x) {
				        if (!arguments.length) return _x;
				        _x = x;
				        return _chart;
				    };

				    _chart.y = function (y) {
				        if (!arguments.length) return _y;
				        _y = y;
				        return _chart;
				    };

				    _chart.setSeries = function (series) {
				        _data = series;
				        return _chart;
				    };

				    return _chart;
			}
		}
	
	
	d3Render.d3Map();


   				function randomData() {
			        return Math.random() * 9 + 1;
			    }

			    var numberOfDataPoint = 5,
			            data = [];

			    data = d3.range(numberOfDataPoint).map(function (i) {
			        return {id: i, value: randomData()};
			    });

			    var chart = d3Render.pieChart()
			            .radius(130)
			            .innerRadius(50)
			            .data(data);

			    chart.render();

				var numberOfDataPoint = 6,
				    data = [];

				data = d3.range(numberOfDataPoint).map(function (i) {
				    return {x: 2*i, y: 6};
				});
				var chart = d3Render.barChart()
				        .x(d3.scale.linear().domain([0, 12]))
				        .y(d3.scale.linear().domain([0, 10]));


				chart.setSeries(data);

				chart.render();
})();

var IndexPM={
		timeRangeChange:function(event){
			var target =event.target;
			var _value=target.value;
			var month=target.parentNode.querySelector(".d3map-time-month");
			month.innerHTML=_value;
		}
	}