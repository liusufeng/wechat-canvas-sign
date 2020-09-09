// components/SignCanvas/SignCanvas.js
let canvas = null
let ctx = null
let endPoint = null // 最后一个点
let lineList = [] // 所有线
let pointList = [] // 当前绘画线的所有点
Component({
    /**
     * 组件的生命周期
     */
    lifetimes: {
        created() {
            // 在组件实例刚刚被创建时执行
            // 清空变量
            canvas = null
            ctx = null
            endPoint = null
            pointList = []
            lineList = []
        },
        ready() {
            // 在组件在视图层布局完成后执行
            this.initCanvas()
        },
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 初始化画布
        initCanvas() {
            const query = this.createSelectorQuery()
            query.select('#signCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
                canvas = res[0].node
                ctx = canvas.getContext('2d')

                // 获取设备像素比调整画布尺寸，并缩放坐标系
                const dpr = wx.getSystemInfoSync().pixelRatio
                canvas.width = res[0].width * dpr
                canvas.height = res[0].height * dpr

                // 设置缩放比例
                ctx.scale(dpr, dpr)
                // 设置线的颜色
                ctx.strokeStyle = '#000000'
                // 设置线的宽度
                ctx.lineWidth = 3
                // 设置线两端端点样式更加圆润
                ctx.lineCap = 'round'
                // 设置两条线连接处更加圆润
                ctx.lineJoin = 'round'
            })
        },
        // 手指触摸动作开始
        touchStart(e) {
            //获取触摸开始的 x,y
            endPoint = {
                x: e.touches[0].x,
                y: e.touches[0].y
            }
            pointList.push(endPoint)
            this.drawLine(endPoint, endPoint)
        },
        // 手指触摸后移动
        touchMove(e) {
            const oldPoint = endPoint
            endPoint = {
                x: e.touches[0].x,
                y: e.touches[0].y
            }
            pointList.push(endPoint)
            this.drawLine(oldPoint, endPoint);
        },
        // 手指触摸动作结束
        touchEnd(e) {
            lineList.push(pointList)
            endPoint = null
            pointList = []
        },

        // 绘制
        drawLine(startPoint, endPoint) {
            ctx.moveTo(startPoint.x, startPoint.y)
            ctx.lineTo(endPoint.x, endPoint.y)
            ctx.stroke()
        },

        // 清除重签
        clearCanvas() {
            pointList = []
            lineList = []
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.beginPath()
        },

        // 撤回上一步
        backoutCanvas() {
            this.clearCanvas()
            lineList.pop()
            for(let i = 0; i < lineList.length; i++) {
                const line = lineList[i]
                if(line.length === 0) {
                    continue
                } else if(line.length === 1) {
                    const point = line[0]
                    this.drawLine(point, point)
                } else {
                    for(let j = 0; j < line.length - 1; j++) {
                        const point1 = line[j]
                        const point2 = line[j + 1]
                        this.drawLine(point1, point2)
                    }
                }
            }
        },

        // 确认签名
        confirmCanvas() {
            if(lineList.length === 0) {
                wx.showToast({
                  title: '请完成签名',
                  icon: 'none'
                })
                return false
            }
            const _this = this
            wx.canvasToTempFilePath({
                canvas: canvas,
                success(res) {
                    canvas = null
                    ctx = null
                    endPoint = null
                    pointList = []
                    lineList = []
                    _this.triggerEvent('confirmSign', res.tempFilePath)
                }
            }, this)
        }
    }
})
