/*
 * @Author: huangwenming
 * @Date: 2020-04-21 15:02:47
 */
import util from './libs/util';
import './index.css';

import Vue from 'vue';

util.sayName();

const vueInst = new Vue({
    data() {
        return {
            name: 'hwm'
        };
    }
});
console.log(vueInst.name);
// console.log(vueInst.name);