//index.js
Page({
  data: {
    signImg: ''
  },

  openSign() {
    wx.navigateTo({
        url: '../signPage/signPage',
    })
  },

  saveImageToPhotosAlbum() {
    const signImg = this.data.signImg
    wx.showModal({
      title: '提示',
      content: '是否保存到手机相册？',
      success(e) {
        if (e.confirm) {
          wx.saveImageToPhotosAlbum({
            filePath: signImg,
            success(res) {
              wx.showToast({
                title: '保存成功'
              })
            }
          })
        }
      }
    })
  }
})
