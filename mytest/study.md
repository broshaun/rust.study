


```sh
创建新项目
    cargo new study
    cd study
    cargo run

一键美化代码
    cargo fmt

    

```


# Rust核心概念
    1、所有权（Ownership）
    2、类型系统（Types）
    3、抽象能力（Abstraction）


## 1、所有权
1、每个值只有一个所有者（拥有者）
2、同一时间只能有一个可变引用 or 多个不可变引用（借用者）
3、所有者离开作用域 → 自动释放（RAII）（生命周期）

## 数据类型
1、标量类型
整数型、浮点型、布尔类型、字符类型
2、复合类型 
元组类型、数组类型





    struct结构体 struct Site {}、元组结构体 struct Color(u8, u8, u8)）、枚举 enum
3、泛型（Generics）
4、函数类型

trait（行为） 关联类型




## Rust 三层模型
    内存安全（Ownership）
        ↓
    类型系统（Type）
        ↓
    抽象能力（Trait + Generics）