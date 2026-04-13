pub mod test_function;
pub mod test_ifelse;
pub mod test_iterator;
pub mod test_loops;
pub mod test_struct;

#[cfg(test)]
mod tests {
    use crate::{
        test_function,
        test_ifelse,
        test_loops,
        test_iterator,
        test_struct,
    };

    #[test]
    fn run() {
        test_function::fn1();
        test_ifelse::fn2();
        test_loops::fn1();
        test_iterator::fn1();
        test_struct::fn1();
    }
}
