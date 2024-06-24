const defaultValues = {
    JAVA: `//선택 된 언어 : Java
    public class Main {
      public static void main(String[] args) {
          System.out.print(15); 
      }
  }`,
  
    PYTHON: `#선택 된 언어 : Python
  print(result, end='')`,
  
    CPP: `//선택 된 언어 : C++
    #include <iostream>
  
  int addNumbers(int a, int b) {
      return a + b;
  }
  
  int main() {
      int result = addNumbers(10, 5);
      std::cout << result;  // 줄바꿈 없이 출력: 15
      return 0;
  }
  `
  };
  
  export default defaultValues;
  