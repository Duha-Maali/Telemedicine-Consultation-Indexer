namespace TCI.Business.Common.Results;

public sealed class Result<T> : Result
{
    private readonly T? _value;
    private Result(
        T? value,
        bool isSuccess, 
        Error error) : base(isSuccess, error) 
    {
        _value = value;
    }

    public T Value { 
        get
        {
            if (IsFailure)
            {
                throw new InvalidOperationException("The value of a failed result cannot be accessed.");
            }

            return _value!;
        }
    }

    public static Result<T> Success(T value)
    {
        return new Result<T>(
            value,
            true,
            Error.None);
    }

    public static new Result<T> Failure(Error error)
    {
        return new Result<T>(
            default,
            false,
            error);
    }
}

