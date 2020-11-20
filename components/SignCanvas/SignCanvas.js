// components/SignCanvas/SignCanvas.js
Component({
    data: {
        canvas: null,
        ctx: null,
        lineList: [],// 所有线
        pointList: [], // 当前绘画线的所有点
        endPoint: null, // 最后一个点
    },

    lifetimes: {
        ready() {
            this.initCanvas()
        },
    },

    methods: {
        // 初始化画布
        initCanvas() {
            const query = this.createSelectorQuery()
            query.select('#signCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
                let canvas = res[0].node
                let ctx = canvas.getContext('2d')

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

                
                this.setData({
                    canvas,
                    ctx
                })
            })
        },
        // 手指触摸动作开始
        touchStart(e) {
            //获取触摸开始的 x,y
            const endPoint = {
                x: e.touches[0].x,
                y: e.touches[0].y
            }
            this.setData({
                pointList: [...this.data.pointList, endPoint],
                endPoint,
            })
            this.drawLine(endPoint, endPoint)
        },
        // 手指触摸后移动
        touchMove(e) {
            const oldPoint = this.data.endPoint
            const endPoint = {
                x: e.touches[0].x,
                y: e.touches[0].y
            }
            this.setData({
                pointList: [...this.data.pointList, endPoint],
                endPoint
            })
            this.drawLine(oldPoint, endPoint);
        },
        // 手指触摸动作结束
        touchEnd(e) {
            this.setData({
                lineList: [...this.data.lineList, this.data.pointList],
                pointList: [],
                endPoint: null
            })
        },

        // 绘制
        drawLine(startPoint, endPoint) {
            const ctx = this.data.ctx

            ctx.moveTo(startPoint.x, startPoint.y)
            ctx.lineTo(endPoint.x, endPoint.y)
            ctx.stroke()
        },

        // 清除重签
        clearCanvas() {
            const ctx = this.data.ctx

            this.setData({
                lineList: [],
                pointList: [],
                endPoint: null
            })
            ctx.clearRect(0, 0, this.data.canvas.width, this.data.canvas.height)
            ctx.beginPath()
        },

        // 撤回上一步
        backoutCanvas() {
            const ctx = this.data.ctx
            let lineList = this.data.lineList
            lineList.pop()
            this.setData({
                lineList
            })
            ctx.clearRect(0, 0, this.data.canvas.width, this.data.canvas.height)
            ctx.beginPath()
            if(lineList.length === 0) {
                return false
            }
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
            return new Promise((resolve, reject) => {
                if(this.data.lineList.length === 0) {
                    wx.showToast({
                      title: '请完成签名',
                      icon: 'none'
                    })
                    reject()
                }
                wx.canvasToTempFilePath({
                    canvas: this.data.canvas,
                    success(res) {
                        resolve(res.tempFilePath)
                    }
                })
            })
        }
    }
})
