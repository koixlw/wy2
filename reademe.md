## 技术栈
前端用 vite  vue3  ElementPlus  
后端用elysia dirzzle  mysql swagger



搭建的一个物业管路系统
三个实体 住址  住户 费用
住址分为： 小区栋 楼层 房间 。 可以使用树来构建，将三者融合在一起，parent 字段指定上级。
住户： 房间 住户
费用：  水电气