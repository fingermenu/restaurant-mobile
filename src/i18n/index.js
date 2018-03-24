// @flow

import i18next from 'i18next';

i18next.init({
  interpolation: {
    escapeValue: false,
  },
  lng: 'en_NZ',
  resources: {
    en_NZ: {
      translation: {
        englishLanguage: { menuItem: 'English' },
        chineseLanguage: { menuItem: '中国' },
        japaneseLanguage: { menuItem: '日本語' },
        fingerMenu: { title: 'Finger Menu' },
        yes: { button: 'Yes' },
        no: { button: 'No' },
        fullPayment: { button: 'Full Payment', label: 'Full Payment' },
        splitPayment: { button: 'Split Payment', label: 'Split Payment' },
        customPayment: { button: 'Custom Payment', label: 'Custom Payment' },
        resetTable: { button: 'Reset Table', label: 'Reset Table' },
        home: { label: 'Home' },
        homePage: { label: 'Home Page' },
        signUp: { label: 'Sign Up', button: 'Sign Up' },
        signIn: { label: 'Sign In', button: 'Sign In' },
        signOut: { label: 'Sign Out' },
        cancel: { button: 'Cancel' },
        email: { label: 'Email' },
        manageTable: {
          label: 'Manage Table',
        },
        table: {
          label: 'Table',
        },
        password: { label: 'Password' },
        retypePassword: { label: 'Retype Password' },
        waitressMode: { label: 'Waitress Mode' },
        yourOrder: { label: 'Your Order' },
        placeYourOrder: { label: 'Place Your Order' },
        noOrdersHaveBeenPlacedYet: { message: 'No orders have been placed yet.' },
        placeOrder: { button: 'Place Order' },
        notes: { placeholder: 'Notes' },
        areYouSureToPlaceYourOrderNow: { message: 'Are you sure to place your order now?' },
        areYouSureToRemoveThisOrder: { message: 'Are you sure to remove this order?' },
        areYouSureToResetTable: { message: 'Are you sure to reset table {tableName}?' },
        areYouSureToPayTableInFull: { message: 'Are you sure to pay table table {tableName} in full?' },
        confirmPayment: { message: 'Confirm payment?' },
      },
    },
    zh: {
      translation: {
        englishLanguage: { menuItem: 'English' },
        chineseLanguage: { menuItem: '中国' },
        japaneseLanguage: { menuItem: '日本語' },
        fingerMenu: { title: '手指菜单' },
        yes: { button: '是' },
        no: { button: '没有' },
        fullPayment: { button: '全额付款', label: '全额付款' },
        splitPayment: { button: '分期付款', label: '分期付款' },
        customPayment: { button: '自定义付款', label: '自定义付款' },
        resetTable: { button: '重置表', label: '重置表' },
        home: { label: '主界面' },
        homePage: { label: '主页' },
        signUp: { label: '注册', button: '注册' },
        signIn: { label: '登录', button: '登录' },
        signOut: { label: '注销' },
        cancel: { button: '取消' },
        email: { label: '电子邮件' },
        manageTable: {
          label: '管理餐桌',
        },
        table: {
          label: '表',
        },
        password: { label: '密码' },
        retypePassword: { label: '重新输入密码' },
        waitressMode: { label: '女服务员模式' },
        yourOrder: { label: '你的订单' },
        placeYourOrder: { label: '下订单' },
        noOrdersHaveBeenPlacedYet: { message: '还没有订单。' },
        placeOrder: { button: '下订单' },
        notes: { placeholder: '笔记' },
        areYouSureToPlaceYourOrderNow: { message: '你确定现在下单吗？' },
        areYouSureToRemoveThisOrder: { message: '你确定删除这个命令吗？' },
        areYouSureToResetTable: { message: '你确定要重置表吗 {tableName}？' },
        areYouSureToPayTableInFull: { message: '你确定完全支付表格 {tableName} 吗？' },
        confirmPayment: { message: '确认付款？' },
      },
    },
    jp: {
      translation: {
        englishLanguage: { menuItem: 'English' },
        chineseLanguage: { menuItem: '中国' },
        japaneseLanguage: { menuItem: '日本語' },
        fingerMenu: { title: 'フィンガーメニュー' },
        yes: { button: 'はい' },
        no: { button: 'いいえ' },
        fullPayment: { button: '完全な支払い', label: '完全な支払い' },
        splitPayment: { button: '分割払い', label: '分割払い' },
        customPayment: { button: 'カスタム支払い', label: 'カスタム支払い' },
        resetTable: { button: 'リセットテーブル', label: 'リセットテーブル' },
        home: { label: 'ホーム' },
        homePage: { label: '' },
        signUp: { label: 'サインアップ', button: 'サインアップ' },
        signIn: { label: 'サインアウト', button: 'サインアウト' },
        signOut: { label: '' },
        cancel: { button: 'キャンセル' },
        email: { label: 'Eメール' },
        manageTable: {
          label: 'テーブルの管理',
        },
        table: {
          label: '表',
        },
        password: { label: 'パスワード' },
        retypePassword: { label: 'パスワードを再入力してください' },
        waitressMode: { label: 'ウェイトレスモード' },
        yourOrder: { label: 'ご注文' },
        placeYourOrder: { label: 'あなたの注文を置く' },
        noOrdersHaveBeenPlacedYet: { message: 'まだ注文はありません。' },
        placeOrder: { button: '注文する' },
        notes: { placeholder: 'ノート' },
        areYouSureToPlaceYourOrderNow: { message: '今すぐ注文してもよろしいですか？' },
        areYouSureToRemoveThisOrder: { message: 'この注文を削除してもよろしいですか？' },
        areYouSureToResetTable: { message: 'テーブルをリセットしてもよろしいですか {tableName}？' },
        areYouSureToPayTableInFull: { message: 'あなたは完全にテーブルテーブル {tableName} を支払うことは確かですか？' },
        confirmPayment: { message: 'お支払いを確認しますか？' },
      },
    },
  },
});

export default i18next;
