// pages/signPage/signPage.js
Page({
    data: {

    },
    // 确认签名
    confirmCanvas() {
        wx.showModal({
            title: '提示',
            content: '是否确认签名？',
            success: res => {
                if(res.confirm) {
                    this.selectComponent('#signCanvas').confirmCanvas().then(result => {
                        if(!result) {
                            wx.showToast({
                                title: '请完成签名',
                                icon: 'none'
                            })
                            return false
                        }
                        const pages = getCurrentPages()
                        const prevPage = pages[pages.length - 2]
                        prevPage.setData({
                            signImg: result
                        })
                        wx.navigateBack()
                    })
                }
            }
        })
    },
    // 撤回上一步
    backoutCanvas() {
        this.selectComponent('#signCanvas').backoutCanvas()
    },
    // 清除重签
    clearCanvas() {
        wx.showModal({
            title: '提示',
            content: '是否确定清除重签？',
            success: res => {
                if(res.confirm) {
                    this.selectComponent('#signCanvas').clearCanvas()
                }
            }
        })
    }
})
