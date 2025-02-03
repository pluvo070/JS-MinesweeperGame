// 获取开始游戏的按钮
let btn = document.querySelector("button");
// 对按钮绑定点击事件: 游戏开始
btn.addEventListener("click", newGame);

let mines = [];         // 存储地雷的数组(存储的是格子的id)
let unclicked = [];     // 追踪未点击的格子数组(存储的是格子的id)
let playable = true;    // 控制游戏是否可继续

// 开始新游戏
function newGame() {
    console.log("Game started");

    // 1. 通过类名获取游戏棋盘
    let board = document.querySelector(".board");

    // 2. 游戏初始化
    board.innerHTML = "";   // 清空棋盘内容
    mines.length = 0;       // 清空地雷数组
    unclicked.length = 0;   // 重置未点击数组
    playable = true;        // 允许游戏继续

    // 3. 创建 400 个格子并添加到棋盘
    for (let i = 1; i <= 400; i++) {
        let tile = document.createElement("div");
        tile.id = `tile_${i}`;      // 赋予唯一id
        unclicked.push(tile.id);    // 将格子的 id 添加到未点击数组
        //tile.classList.add("tile");  // 添加属性: 类名为 tile
        // 3.1 随机设置约 10% 的格子为地雷
        if (Math.random() < 0.1) {
            mines.push(tile.id); // 添加到地雷数组
            //tile.classList.add("mine");  // 添加属性: 类名为 mine
        }
        // 3.2 监听格子的点击事件
        tile.addEventListener("click", function () {
            clickTile(tile.id);
        });
        // 3.3 将格子添加为 board 的子节点
        board.appendChild(tile); 
    }
    console.log("Mines placed:", mines.length);
    console.log("Unclicked:", unclicked.length);
}


// 处理点击事件
function clickTile(tileId) {
    // 如果游戏结束或该格子已经点击过，则直接返回
    /* ★★★ 注意这里遇到已经被点击过的格子时直接返回,是递归的结束条件 */
    if (!playable || !unclicked.includes(tileId)) return;

    // 1. 根据 id 获得点击的格子
    let tile = document.getElementById(tileId);

    // 2. 根据是否是地雷, 选择格子的样式
    if (mines.includes(tileId)) {
        // 2.1 是地雷
        tile.className = "bomb"; // 更改类名为 bomb, 让 CSS 文件显示炸弹样式
        tile.textContent = "*";  // 显示炸弹符号
        playable = false;        // 终止游戏
        alert("💥Boom! You hit a mine. Game Over!");
    } else {
        // 2.2 不是地雷
        tile.className = "clear";  // 更改类名为 clear, 让 CSS 文件显示清除样式
        unclicked = unclicked.filter(id => id !== tileId);  // 从未点击数组中删除该格子
        let count = mineNeighbours(tileId); // 计算周围的地雷数量
        if (count > 0) { 
            // 周围有地雷, 则显示地雷数量
            tile.textContent = count; 
        } else { 
            // ★★★ 被点击的格子的周围没有地雷, 则自动展开周围的无地雷格子(递归)
            let neighbours = getNeighbours(tileId);
            for (let neighbour of neighbours) {
                clickTile(neighbour); 
            }
        }
        // 检查是否满足获胜条件
        if (unclicked.length - mines.length === 0) {
            playable = false;  // 终止游戏
            alert("🎉Congratulations! You cleared the board!");
        }
    }
    //console.log("Unclicked:", unclicked.length);
}


// 计算某个格子周围的地雷总数
function mineNeighbours(tileId) {
    let neighbours = getNeighbours(tileId); // 获取所有邻居的数组
    return neighbours.filter(n => mines.includes(n)).length; // 统计地雷数量
}

// 获取某个格子的周围格子的索引的数组
function getNeighbours(tileId) {
    let id = parseInt(tileId.split("_")[1]); // 获取格子索引
    /* split("_") 是一个字符串方法, 用于将字符串分割成一个数组
       例如对字符串 "tile_5" 调用 .split("_") 将会返回数组:["tile", "5"]
       tileId.split("_")[1]: 使用数组索引[1]来获取分割后数组的第二个元素, 即 "5"
       然后使用 parseInt 将字符串 "5" 解析为数字5  */

    let rowSize = 20; // 每行 20 个格子
    let col = (id - 1) % rowSize; // 当前格子所在的列(0~19)
    let neighbours = [];

    // 计算潜在的相邻 8 个格子的索引
    let potentialNeighbours = [
        id - rowSize - 1, id - rowSize, id - rowSize + 1, // 上方
        id - 1, id + 1, // 左右
        id + rowSize - 1, id + rowSize, id + rowSize + 1  // 下方
    ];

    // 将索引合法的格子加入到邻居数组中
    for (let n of potentialNeighbours) {
        // 保证编号在合法范围内
        if (n < 1 || n > 400) continue;
        // 计算潜在邻居的列位置
        let nCol = (n - 1) % rowSize;
        // 如果两者的列差超过1, 则说明跨行了, 不是有效邻居
        if (Math.abs(nCol - col) > 1) continue;
        neighbours.push(`tile_${n}`);
    }
    return neighbours;
}
