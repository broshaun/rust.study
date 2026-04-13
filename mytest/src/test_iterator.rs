struct Counter {
    count: usize,
}

impl Counter {
    fn new(n: usize) -> Counter {
        Counter { count: n }
    }
}

impl Iterator for Counter {
    type Item = usize;

    fn next(&mut self) -> Option<Self::Item> {
        self.count = self.count - 1;
        if self.count > 0 {
            Some(self.count)
        } else {
            None
        }
        
    }


}

pub fn fn1() {
    let mut counter = Counter::new(5);



    while let Some(num) = counter.next() {
        println!("next {}", num); // 输出 1 到 5
    }

    let counter = Counter::new(5);

    for i in counter {
        println!("for {}", i)
    }
}
