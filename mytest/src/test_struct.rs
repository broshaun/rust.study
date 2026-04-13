
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn create(width: u32, height: u32) -> Rectangle {
        Rectangle { width, height }
    }

    fn area(&self) -> u32 {
        return self.height * self.width;
    }

    fn perimeter(&self) -> u32 {
        return 2 * (self.height + self.width);
    }
}

pub fn fn1() {
    let rect = Rectangle::create(30, 50);
    println!("{:?}", rect);

    let a2 = rect.area();
    println!("area is {:?}", a2);

    let b = rect.perimeter();
    println!("perimeter is {:?}", b);
}
