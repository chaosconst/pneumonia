# 中国新型冠状病毒肺炎疫情地级市图-每十万人发病数估计

本程序是根据 lispczz (https://lispczz.github.io/pneumonia/) 这个工作进行的修改

## 使用说明

### 更新数据
```bash
#获取疫情数据
$ python3 src/legacy_fetch_data.py

#计算每十万人确诊数据
$ python src/pts_city_detail.py
```

### 生成网页 
```bash
$ yarn install
# 可以直接访问
$ yarn webpack-dev-server
#请访问：http://localhost:9000/pplt_ratio.html
# 或者打包后使用静态文件服务器 host
$ yarn webpack
```


## 注意事项
* 直辖市不细分区县
* 常驻人口数据为 2010 - 2018 之间维基百科和瑞士圣加伦大学上的最新数据，并不一定准确

## 效果

![效果图](pplt_ratio_demo.png)

