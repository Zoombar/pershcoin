const { useState, useEffect } = React;

// Telegram Web App API
const tg = window.Telegram?.WebApp || {};
if (tg.ready) tg.ready();
if (tg.expand) tg.expand();

// API базовый URL
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : null; // Демо режим

// Base64 изображение
const COIN_IMAGE_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wgARCAHuAeUDASIAAhEBAxEB/8QAGgAAAwEBAQEAAAAAAAAAAAAAAAECAwQFBv/EABkBAQEBAQEBAAAAAAAAAAAAAAABAgMEBf/aAAwDAQACEAMQAAAB4ad+PrNVSzVVE06E6qVN0k06iXVEO2SWySmSWRJbILCCwgsMzRELRGa1RmtFWa0RkaSZrRGc6zWU6yZTtJjO01lOs1lG0plG01iaFdNF4qp1Cp0qp1CdMTpidVJFOiXTJdMksJdBLRK3CWzMNVmGiloxuyFojNaIzWgZLWTJaJc50VZzrJlOsmc6TWU6ymU6zWU6zWRYdNOs1U6hWXCdMTpiboTpibpIpgEznVylNNDzZKZC1FyNAyWyMlrFS0Gl4KzrOTXWdVRcQrDOdEuc6yZLWTOdEZTrJlG01jOsmU6zWJoWdNOsVU6BuhN3E06Jpuk6ZNESqQxpFrOh5wuyyGtIQAFo0DE0d5laGYmmZaYHTBhrnFne/P6dY1WiuM1pK5zrMZGk1nOkmc6SZTrJlOs1kWHRTrNVOhU6RUUJtgyxXojKLxzus4MbQF0AKmCIaUAQBDEDctWJiYWAFaTDTCO7Ix7/ACzWfVUauUK0ZzojONZMlojKNZMp1m3IsTopvNKboochRQqWlGwtQ5s8uXRpk2gATATSiMbNY5uPrj0s/Lvrz9Jecz0b8tS+vXh9fPfpPCue9axvOrJatMpUiy+HrtPM9Ti5dT3lju4wrmInRGStLnOk1ktJMiw3tVK2qRspBjp7meo+Inl0AJoAAEBOGptjw8Ho5+ryeZl6OfdjyHSdFcbOuuJx3Pis7NPOZ7Wnj9HLXqa+b0cOvdfNpx6bOXjVCagFVz7Ozyva4+HWffQ5yhXKQrlYjWTKdJMyiuhlZNlAN2G03ouO556gomoKCVUwZLg65187Dn93FZaZ9ZEt1M6OMjbQ5a6Gcx1s5K0QVCjp7fJ6o9PfztvNv1NOPo8/bd53z6DAAFrk6aufP9rxO7eOxUpzhXMRNpc1SIKLdmVI2qClrqVhvzLJRz1BQSrRHPp5vTB5Vcvv5yr06Xlfduedt6Ny+aek83zb9Bnn16FRwX2C8EekJ5mXslngL3cLPM6Fgm3dxrjPa24erx+nYTxsAUAK8r01c9j8v1dc5VTJM3JE6SQULrSpG1SHZjv2zyTRy3KollWonDXzdzHzNuT3csN+zu7a5NulauL0UsjeEtvNkoAbSWwAYNNKFVkeb66PnOjp42V6fKuE9XTn28fppp50mCpiXl9blz1z71Sc4m5WVSJAXWk0oKTpxI2okzaSYRfPqc3k3x+3mqrt7a3orVmKikhyoZgUnDTITahuWMYibCWOwqaDy/Vyryy4Y6O3z+7w73cX5+7AVDBKqTqUaa5ymEKlLAw1Y7C5SJyTVEhZAHl9Xi+rlOd5+xv38XdvWsaZ25OrTMrOKMqyoDJuWNyQVKNHhCdT8/Oz1X5FHqHB01uOZeTk9Hzkro8/q5Z9Vxfz/QwM6AAAt6rx3vOFSshXMsjDSk7Hjrz5tEtaJCic7OHh0z+hxyav0a17eXqutVPmptwa7SeZj7ik8CvV5Uy6Ody+n0+T1S96ztXhvknBzehkeXXpdCef09928B30nL2ZxG3J1ZTXndGOznv6ng+34dtt8O0pghktdfD23JNzrMzSlQEaVNWZ4XlnVkFtkhXF18G8eF6Hnej9PlCDeuzq5e264sN8pnQwzjrnKY6J53DxqZqenm3s7ds9RY9GGXLj0YKteOLPVrx9dT075d5da5tZbVknnrXG4r1fN9DzO1aT4u0K1bBRLHThqmqpazKqYQC3SdnLFTNgAJgufp5q8Lsw6Pp8MR11vb0462+fntjlhl0Snm8XvJPG9Hs2jmXa5cdqrWrvC2tiXiY8noRHkY+znc/Mv6Q1PL09S5ePp6HLGs2cWW2bnntGvGe6qPD2zm1NSUiNJqNk1rKTUsjC2CcaabAAADm6uU8y1H0uM65bdr3VOurz3tJnntOWTslg0mJHFlQi3WsiOiubTJgSNCGqBWPSqmkQyOPk9Hymdc9p55+j0y18u81Rx6SrRDZGipJKaVAGgmnGA2IAAHydXHXn5Z19DjW+e/fXbeS1dJzcaEkDklcuIWS5k34Y82z2NfH7I7c4yze3t+b9BfWWOxdZ2luXZTkKJIPN9LjucI15s4+l6PE9Tz3oJvz9JWkyyOlJqZEmpUAttNnlm4aQxUAHneh53TOHR5mvuvdOVWbyR2jUSdFcusayGDinbHN2zc+T0dzs5TqJMNLuMOb0qlw00IyNIV1DKcislq86EmMuKb9Tbyuvjj2tObfyzRw1qo31MJa51JzKALVS2ccujnaAABC4eri6ziNK9vSano6c3lpnuTFzIaZVltWTNzOrLILLnk5Jv1n41S+u/KE9l+T1ydplbLlzKgFaFNUItc0JGHQs65aqMZ9Xp4+rxzZxWbXVy9HXHOhcdCaVAS007Dl6sCCkqVI5vJ9jyO/NbcHpe28V7RvfTDnWIm5iWLKmg0SSYc3creK/Td15z9Fy+e++o8nP3FJ4/V1TMVpDKAVobQDgmsqx6c9prn5tI5cfT6uTq8m9qh4u15VqJNZEslQC0J2VnYmBSVTatx8v2OTpz+Z9rl7foZ2xzx111fnd9yocwJxGjysuoaUSRoZJdM5Re3PcnXXNqu0oRgAA1Qm0JqHrxaWdeStPP0x6/Lnfoy1829HFZu1BcpBKk0AgppjE7JjbMkotiNked4v1OHbPys/TrtPn+jTl9M6pqdaScZOostpyNrSJNqOetWZm1GFbMyq2QUEDGkNSiCvGx6+nny5dddM3P0Vr5ehafPVa49cjQrkBSiABEU0UwKpDSVRpIyEqKgtHB5H0vH0vk4ehwe7MmZqaVlRteGhpeOhq82urhyXeNGxlRooItIlQS05QFvTm4+ytPIl0c9IYAONdwuEglEIAAES0J2DTCpaMHqIpUhhKoJVC8vme5lu/MYe75/qnDVZds7act10a8mhu8FHTXJUdRzM6647l6nyh1LnDec+maz3vXzptnn0m1kAAAHTG7IgkSaUTBApUAUAMTsYA2hLcXuIoqSkSMiSkRzdaXx+L6TDpfl8vpebvPCPZW55B6weS/VZ5L9Znk169Hk6evpl5G/onO460+GkMwTQoAA0Gi6UGJkQSoAQKHLSgA2mAOwcsYBQhNzHo65hbZ1KpZsjUJUEphKuVidUuTsiRqmSRSkEmRKpKgAABMEMUt7oAMiCUQCaIE0qAAAYmMBBpg0U2gYmnRrxadsXOsLCDFAQJoEAkxUmoJpKgQJoEyEmhKkqAALI3ukQKQAUTQIIASgIABAKxNGANoBoRtFMAYhKvMq0ixiKAQIFAISYIEJUlQCoCRAKk6SHtZnoCAiUAEAAKABRACAECgANA2hG0DEwGkbl0wQwBiEpJgDqRlJMJGgTJZGyCwzNaMa1SJihiAAUEAACHAgVAAgAEACggYAxNBoG0DEwAQaBuXTEDEwaBiEYgYimIGCGIhoBoFAEASsQAiAaAQACgIEAAKAgAGJg0DEI2gYmDQUkwaEGgbljEDEU0MAAAAABMBANEMSGhggAAECgAAgTQAKAgAAQf/8QAKxAAAgEDAgYCAwEAAwEAAAAAAAECAxESEAEEyEwMUAiMhRBUCMzQmCA/9oACAEBAAEFAv8AzFvSt/6W5cyLmRkZMyMjJF1/Qv3rmYpL+VfdYxZiYmJiYGDMJFntuKYmn/Fb2WLF4mZmy733ZmzM+DMBxa2RqCaf8J62MkOT9FSZdMcB9NE7Eanv216Iy9fIcExprSFRxE1L20r6MY5e3lclTGKTi4TU/ZS1lPuZDmcxHMOYcxGRkX7SdhqNQnBwd7OlUzXrJaN2JTv25SHMk2dTprceZlJEKgmXL9lO6qUsROxSqZr1EtJSsSd+zccx1SVUdUdRmZcyZkZGbOYRmiMzMUxSL9iLsVaQm4ulUVRemiUrDd+wyUidUnVHMctbmRcuZGQ2JkZCqCdyImJ9hOxWpXVObhOMlKPoxRJ2H17DZOpYqVSUr92+iZGZGYpCkJl96divSOGq4S9CKH0G79iUrE5k532MsWLGJiYmJiYDiWLaftEZC6EZiYt6djiKWD4WpnHvok79iUicypPZYULnLOWcs5Zgcs5RyzljpnJOUOiOmxdBMT6cyxTncXYVmpX4erFqS7sUT7E3YnUKkrjFG4qZGkKkKBiYmJYxLFixYsYljEcCVEnSaF0bjkofEhIXYqQ5tPgqnXupdHvm7E6hOQ7lOlcjTsYGJb0LDiVqJGTiSWSpyxcZC3o4iOE4vKPbprrN9N0irMqPpDrJUyMbFvURYr0SDs5RTIfFxfYXyXC3j3I/FN33MqTsVGPxSh1S9hlamRY+pSYuxPpPtIk982VpddKaF7M1dSji/wB+CDut66lP6eg30rVCZFESOj9mohi6lOVn2I9p76sul7ti8xIaMtp0MkZIyXYuOSHVR+Qh8Uj8pC4oXFIjVjLRj6k/MX1KXWO+n2m9zOIl0/R+4kdHZFSvYlWmxyqDlMzkKrIVaRGsyNW4pbJslck2PJipyZHh2LhjkHKaISlEU7jKi0S6UJ2b3x89h75Mqu83oiIiUsVKTYoCgYmCJUIkqByxREiItZDQ4oUCKLbMS1tJjXWJe0qTyj35+N1eVlGbc/0xENKotbmaMxtDtrEQhjJaZCYrnyLyMi+svDETOH8PfDxvqed3Er/OC+ciQinpU8jZdyMUh1acT8mBzoMutGiBEWkkOJIckh18RcSxcWyHERkdGX0RLxLR+OHY98OxP7buI+qX+nkkIoj8T8jJVlElOcjqhSKCuSpojFrSEdFqypHI5ditC46UhU5kafxSqRIyYhaPy0T+vC3F43Q875fbdxHl9GMiUiXiQ4sdK5yUctHKRGjFChYxLCjqtjiOBgcs5ZgKBgYFtKnkf14aSvAe6P23vztRX+9RI/TIlPxIxMSxYsW1tsS0WjXatpVQx/Xh/tRJedq891ea33q/VfUiQ8avffTIyMhSMjLuVPD+y8UukqBLztXnurzW+9X6w+rIEfFy/YbLkmTrRTjWjIcxTHxEUQqxkRkMv2ZFRdYkJfPh2PztXne/O7iHaU6pS0jpcvvZIcicukoOThScTqInw+ZyZU3SmKV9F2ahEqQqZcNUExbV53y87uJ6y/zpikpDiheXrcT3WJ07nJZCmYGBiKJKF0uH6xp27bRZI58UXjMpTI7Y+Xvn9trKxUXWBmRd5S2rfYt6TZPqOBSunB/KItkfrvn53VCS6rzJFFdZd1tCkjodDNd1DLDRH7L/AJIC2S6Q3z8bWSl8p+UiUiLsS7Fy+jkidUc2zITZdlxVGiNYUk+5GRNEPN/9Ii1j5qdh+NjJFZ2I/OP6kRkfoe9slUHMSlI5ExUJHIZGgx0JDozR8okagqxGXZk7F+vlS+EafmAtY+Zeew/OyRXjcpfF/rl3OXYj2nBMjSQlvxHSizlRRbsyjk+WxKxxJSIi1j2pbWV4HyU4wdvCZfq/L7SkXLlzIUhMuXL9paWd6vWUIkRax8d+pG5hao6g5kpmd5f9e9bRC7c54kagpmRPrUghd97WirT6TyiNyIZSbgoFKakPattixYxMTEsW7fGN5QnJCqnMZBXaWyHpWJUkxUETopKrSyIJQk9q2r0pxynGkh0SFIjHaui9WtTJU/lJD9r9KHVItugvYqUycSS0uX7Fy+ly5fZfakWEt66+1OmTgTjrcuLS5fS5cuXLl9b6X0QkJdmKt7c4KRUpE6ZKFtLlzIUi5cuZGRkZGRkZGRcRGAkW7MI+9KkmTpEqRKmYvtosxRZGmRjYt2oxv6q7jppkqI6JyTkHIPxzkHIPxz8c5AqAqBy4osi3bir+uuvexRiWLFtehcv3oxv7MXca/hRj7cZjX8BR91SaLpjXuKNxK38BS9pK4o/2khR/s2ZiW/q2LFjEt/8AB/8A/8QAIxEAAgIDAAICAgMAAAAAAAAAAAECERAgMBJAAzETIUFQYP/aAAgBAwEBPwH+ro8TxPEr2KK4UePp1nxK1oorFWOPopFdKw4ldlHVsfyH5T8p+UXyHls1Y10S0bHMvZSFMT0aGr5rSUhyvSiiisqRGWslxWkniiiiiiiiiihoUqIyvVrd6N9miLoT0a3Sy2fYl2ZCWj5SEtLLL0ssvLQv0Rej7UUVpRRRWWQektVmQsIeLLFisssTyyIsvtRQtWiissQuaP5wtK5vCfOx/fGy92sR5s8d71svVRslGst8GxfW6RR4lDWVpE+RixL74SIS42WWPC0bGxcpI+NcLLL0WtC5tCPoT6vH7EsP2FhoS9Jr0G/Ro8SiiiuDfVPa+bfahd792/8AUf/EACYRAAICAgICAwABBQAAAAAAAAABAhEDMBAgE0ASITEUIjJQUWD/2gAIAQIBAT8B9a9F7bLPkWX7DkX1vmy/TbHpor1G9teh+Dd9UiOJs8B4DwDxNHx9L8G76KNkMJHEkJdGiWIljHHqvvW3fSGOyGOull9GieMcdqJPpCFkIVzfFl8WXzOBKNdEx94L6sfMYWQhRXDQ1qyQGuifZDlzFWQhQlyx68saHtwx4XL7UUUVzkjaGui0Iwr6FzZZfWy+2aNdFoh+kFy+K70V1z7I/pjf0Lh6bL65fwrWjD+C7LhvTk/Bx/p1xRiVd1w9MkT/ALdeL9GyD7VrbMiHxFD7419lEeq2MkS4j9LRjEu62ZGPi9EHRF3ovXkY3rhl+J/IITse6U6PMicr3Y5/EjP5arL4nkolK/RjOiOUvRQ3RPKN3uXaORoWY8yPKjyo8iPKh5kPOObfoxdjjov14z/2Ne/Zf+Bssv8A5H//xAAsEAAABQMCBQQBBQAAAAAAAAAAASExUAIRQBAwAxIgYGEiMlGBQnBxgJCR/9oACAEBAAY/Av4mOHDhy2Vi1PRC21IfAQ+lQkKoTDUh6T6FglCY6j0hdPATPTLtUL0aIPOYmeqGFFyHmIfR9X3rVML0qWnmc5qP8FyHmc56PshcXKc56PsWNjnPA5qfaY5TcpzlqY9CMpy35EwPh1SCCx6LtFxqARlIXIWPbOk2MVcOpykblrbZp4v0c6dPyFcsKxRf74V9pw8jb52E1XJtArKHutkFBqfQh7baLomAe+RbKi1OraJuN0LFMPbIGCnDnTB4T6uEOHsGhL2C4xBXhrkh90POPOOHDh9Gnm7Ltjr2AoXOTOvSU9cmhr5Fynr09v3zk7Ob9H1/pW//xAAoEAEBAQACAgIDAAICAgMAAAABABEQISAxQVEwYXFAgVCxcJGh0fH/2gAIAQEAAT8hIIILLIIIIIOoIILOrILLLLLLLLLLLLLLLLLLLLLLJLOMskkskkskksskkskkssggssggggssssssssggssssgssss4ZZZZJZZZZZZZZJZJZwyySSySSSSSySSyyCCyCyyCLLII4yyzgLIsssssssssssssssksskssksss4ySSSySSSSSSySyyCCCCyCCCyyCIO4LLLIOCyzjqxfzfxbtWuDf0R39cH7OM4SyyyySySyySSSSSSSSSSTjIIILIIILLLLIOcss4zhSXavz+URC+e5V0+uMsskmeE6kskk4STqSSZJLIIIIIsiLLILOMs59T9bt8dPxafFv7L+Vj62frwP3E/RP1M+Ah6b6V6F5zhLOEnhJJJJJkkksg4CCCyOAgizw6JfjwE/Fk9BZfbfoX7Zb5fLuC9LH27dvS36Gd/U3sjnckOu/IsmyZJJJJ4SSZJLLILIIsiIIIOM5+OWNgO+WPp/tkfP/r8W+XqH8307+WvyQViTItGN66/vhJOHhJJOEkmZJLIg4CCCCIODgLBMncnsf6n68n9/4op6jZhEvav9M70zj9h9IzVsnDMyTJJMkkk2RBwFnAeGTqADOCD2383+V8wBhpdemn1a+bYLI7/pJykkzZJPCSWWQcBwcHBbv6gAm/ulV7/Fsgh+5L54/wBQ3qDkD7ibwPmnoxH/ALN0R/uH6hjyeqzMycvCTxkeuCL44OMtn9R0RjuZ4evxLYlqSX3PeaDth7mn3CPVtD39nfdqe4hBt8xwtjQUej3Hk9V4ZnhmeGzgiOTjZjogMr7/AAbIs4iPi+xa33Oy/dDbR8x91j5tF0dMU9giD5qv19R57T5+kJ6EtD/scPDwzw8ZHJwcBDCIyLX8Csj3CfMj8y/cu2rbw1ahkQ5Ch880X75AfN3FkwaP+/3Eu8Zn3MzwzPBweBYFjkrWyzyzsnuVOpPlOy8bK3dl3Gtl3axN0jPmQfdpKW91RDyd6RZn18LsOn14PLJwcEc6MsbbOU8GyX75l7ln1N7RNxTtHMP0m48Nwdxsdp0zV1acC89n/wAr/wDIjyVnwyIjkO4YWz9SWcZZwxEfza9Ed/Mz7hPxbvV/N/PApdRCkFsTUjfEM2b6tZ292Kceeh2QCvx9/Zekp5Z4Z4OCIu7ZYZxni2KLbVwT1kv0QHxEfFj65MxDN/Fjg05QvxC/F6Um993mTXjC+mceYN/YkPgvUzPDM8Eclnu7tlngwi2W3ctvU3vwg5AOGc5Z+LLEKero0S8Dqe5MoSdM+o8ljpJ9k7j9SZmZ4eCOdNWWCfJYWMMxB76hHqzy+WfhLeDptOiaztJfxuiHzBLH8iev5MzM8nrg4zOzxyeFm92r74vejyDhf8MYYCWDhLkfjOduB5fN1KXxeDk68m28rdFo5VYNsTgyz+PfxEPMD23ijzGU9Caj9B8HkiPcdC287bxlw5qcA75q+Ysss/Ic5Jy3z8Hi6ucTSPI6vdf6mefnwJ9Zxvjkrbq22unMwjvZko+SfrX60J8lpbacbbyF8wPmQgcy32XzV/O+HV3HIhdPcqzHzfWeDPBz2Ntvgur+tPUHuD2jw+JDrfDXq53y32ll8t9hvtXz+IFvXCyZa/MK0epiT7gD3An1VnO1hPDQvmX0m1XY3zec314HHQ8d46o/53pyEIIblWAfFj6lz0SviEepzLON/V6xJDh+jBvqD6iYcd/MiNuoh1wF8St+ByyzxOw4fJ8t8NddzZhwva7R6kxjMtk/rkFe4qTIe7vHqEOPtfMYZ2H3s+1l7IL7i7pENh4fRwjvjJPB+F8F08N427llegZazgdk64NjCGYRxJTXqEysd/ctu9ODNwDPcp98Q96iOC93OeshD3D1xEBemQd48hZ+GfH3eeYAR7Xvah1dYothdWQHyRL3HzazvVNdl81k97k0sOFEmkMbN7gP1sh6L4s3GjY+mN6o6m+vO9kZ3xHPzZOXa/NnOT4b4+zz9Z+oBt8XvC9OIdyPUns2fxAfEvwB8Qy/eOIuFrbs4e4GD65P7OYD+yLpHq6T2X6pE7EOHlvV+D2eXtwsyusz76vTi7EQMmTZsWWcMmzeRFm2EcZZZBEFnDOBfEO9svp5DeuffL4Pt8vRwhu703SXrxZHRfPLLOVmbBI8IYZtt5OC3kzrBsDL5nw9E++Xn4n35ejjah7m1uF63WPThvfk8HZhC7U3rJ+y6e2YyekIkvbgMeO8el7FrLDCwZ7n5PRPvl4OPZ5em7n9Wyju1nsTm+r3twvSYNsvLyZM8193kQdQjqPaS53xT15N5Yd31+bpez9SHXW1ZcvB6T78Tj2+T64A9gH9o7oDjDOMl5O8d7Pq98Phy77szuz9WfqDdEGF7GxXJI8tt22b27TkFxjsyXUeBnt4n4D0vcmfeSWvnjPe2eBlDyTZ4hBZHKSR47HuytibeQL68QxM8PifIx3gGLkvZvaZeuCGGGOeuAfMn5u3yWj4R9sI8HLPmM9OE3pV1KPIvifI+R5d3wRC9pmeCIe+bYF9E5C+77S/dwagffCbbbPkT6uzL5Y+92U+r1jj0T9H4O2PJ62rZAT1elvEeDwcHGBOfqd+b0gwn6hHgRR8nPzRR76mbQvd35FmiyO5bdy64nOt8xwc8DHq+xNx2e4N93dpek+5nx+OPbkF3LH0ZPv3H9tMj9N3J1JTvG9tPiEZ9R+BISepxLo8OcLueW+fE9b4MepkcboHuWPiTol1GOUfc8DwRxvAiYvYX3xdPI8tt8SHUmmXzPVmWJHwfJ4PJy+rPBLNaB9IfRa/MJ83xIdm8Mwxb4t3ZEC0cCSOuM8WPMCe+A62ejgMcHcdH4Tg2cpw7dIp6sfQws7GC4cmfJkcs8BJl8WWeXzYBCfmffUN0T6vERwe94eXz+L54yyydXxcF9X+zS+VYovS2XyEQ4SIsssss5eXwnJ2W70WMJZwR7j+UTxyyy9WJ7FdawDhvJDHBFscEc9cvgvCTffHmzx74zw/jzjPL/qM+U/6tCyl5CIbe4thjg2OEmxbduFl5npDB5DWR0Yf46Xzb/8ARe/qUbstiEUPcdImxyiEJtvDTisFbHhzzLN+/B8XwPA/DkB37+5T2SyTs4FIHhyYswfuD4bcFk9t9ZH4XdrwfM/AeGeGcJ1931D9X2GcaD6kPix+ru7u7u7u7uNjYMV9KVh+G8M/Dt/X4Pj8J4dvxpvu/VX6Ng+pM/pfzw/mL/EfpH636YPqPcyz9cGfiV/q9euH8Z+A6Z4/cn4XlBv0SObFhdcMfVv4wlX2/lRfq6Dr8p+IU7h6vvhT8D+J8n8KPb6j1/gfP4vi/wDe0OpM/G8s/nDbPt7/AM3/AOpgv7sP8xoQ/wCAT57tH8L/AIC+kJ77/wAX5/w3wfysrAe/8s/zffEfaAfH/H5ZYyNjY/Vpt2/uBZjP/M+/8P8A/9k=';

function App() {
    const [coins, setCoins] = useState(0);
    const [taps, setTaps] = useState(0);
    const [referralCode, setReferralCode] = useState('');
    const [showReferrals, setShowReferrals] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isTapping, setIsTapping] = useState(false);

    useEffect(() => {
        // Генерируем реферальный код
        setReferralCode('PERSH' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
    }, []);

    const handleTap = () => {
        if (isTapping) return;
        
        setIsTapping(true);
        setCoins(c => c + 1);
        setTaps(t => t + 1);
        
        // Вибрация
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('medium');
        }
        
        setTimeout(() => setIsTapping(false), 100);
    };

    return (
        <div className="container">
            <header className="header">
                <div className="balance-container">
                    <div className="balance-label">Баланс</div>
                    <div className="balance-value">{coins.toLocaleString()}</div>
                    <div className="balance-unit">монет</div>
                </div>
                <div className="stats">
                    <div className="stat-item">
                        <span className="stat-label">Тапов:</span>
                        <span className="stat-value">{taps.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="tap-container">
                    <button 
                        className={`tap-button ${isTapping ? 'tapping' : ''}`}
                        onClick={handleTap}
                        style={{ transform: isTapping ? 'scale(0.9)' : 'scale(1)' }}
                    >
                        <img 
                            src={`data:image/jpeg;base64,${COIN_IMAGE_BASE64}`}
                            alt="Coin" 
                            className="coin-image"
                        />
                    </button>
                    <div className="tap-hint">Тапай, чтобы заработать монеты!</div>
                </div>
            </main>

            <div className="actions">
                <button className="action-btn" onClick={() => setShowReferrals(true)}>
                    👥 Рефералы
                </button>
                <button className="action-btn" onClick={() => setShowLeaderboard(true)}>
                    🏆 Лидерборд
                </button>
            </div>

            {showReferrals && (
                <div className="modal show" onClick={() => setShowReferrals(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>👥 Реферальная система</h2>
                            <button className="modal-close" onClick={() => setShowReferrals(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="referral-code-container">
                                <label>Твой реферальный код:</label>
                                <div className="referral-code">{referralCode}</div>
                                <button className="copy-btn" onClick={() => {
                                    navigator.clipboard.writeText(referralCode);
                                    if (tg.showAlert) tg.showAlert('Код скопирован!');
                                }}>
                                    📋 Копировать
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showLeaderboard && (
                <div className="modal show" onClick={() => setShowLeaderboard(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🏆 Лидерборд</h2>
                            <button className="modal-close" onClick={() => setShowLeaderboard(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="loading">Демо режим: API сервер не настроен</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
