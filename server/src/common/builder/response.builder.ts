export class ResponseBuilder {
    private statusCode: number;
    private message: string;
    private data: any;
    private errors: any;
  
    constructor() {
      this.statusCode = 200; 
      this.message = 'Success';
      this.data = null;
      this.errors = null;
    }
  
    setStatus(statusCode: number): this {
      this.statusCode = statusCode;
      return this;
    }
  
    setMessage(message: string): this {
      this.message = message;
      return this;
    }
  
    setData(data: any): this {
      this.data = data;
      return this;
    }
  
    setErrors(errors: any): this {
      this.errors = errors;
      return this;
    }
  
    build() {
      return {
        statusCode: this.statusCode,
        message: this.message,
        data: this.data,
        errors: this.errors,
      };
    }
  }
  