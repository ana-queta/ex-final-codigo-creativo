# Processo

### Conceito

"Love me, love me not" é uma experiência visual interativa desenvolvida em p5.js que visa explorar o impacto do amor na emoção humana. 

Como espectador, é-se recebido por um ecrã que tem como fundo o rosto de uma mulher com a frase "love me". Ao clicar nela, surge a frase "love me not", que dá início a um ciclo de contradição e de sobrecarga de pensamentos. O ciclo para quando aparece no ecrã a frase "Do you love me?"; ao clicar nela, recomeça.

É uma simulação do _overthinking_ , o ato de pensar em demasia, tornando-se díficil saciar a necessidade de confrimar se o amor é verdadeiro ou se irá durar.

- Input: imagem e interação com o rato.
- Expressão: mapeamento ASCII e animação elástica.
- Output: composição tipográfica interativa.

### Execução

O projeto foi desenvolvido para p5.js 2.x.

* conversão da imagem em ASCII

vermelho, verde e azul são combinados para obter um valor de
luminosidade entre 0 e 1:

```js
const light =
  (0.2126 * pixel +
    0.7152 * pixel +[1]
    0.0722 * pixel) / 255;[2]
```

Esse valor é ajustado e convertido na posição de um carácter
dentro da sequência `ASCII_CHARS`:

```js
const ASCII_CHARS = " .:-=+*#%@";

const adjustedLight = pow(light, 1.4);

const index = constrain(
  floor(adjustedLight * (ASCII_CHARS.length - 1)),
  0,
  ASCII_CHARS.length - 1
);

const char = ASCII_CHARS.charAt(index);
```
Desta forma as zonas mais escuras recembem carateres menos densos e as zonas mais claras