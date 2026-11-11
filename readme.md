# Processo

### Conceito

"Love me, love me not" é uma experiência visual interativa desenvolvida em p5.js que visa explorar o impacto do amor nas emoções humanas.

O espectador é recebido por um ecrã com o rosto de uma mulher em segundo plano e a frase "love me". Ao clicar no ecrã, surge a frase "love me not", que dá início a um ciclo de contradição e sobrecarga de pensamentos. O ciclo termina quando aparece no ecrã a frase "Do you love me?"; ao clicar nela, recomeça.

É uma simulação do _overthinking_, o ato de pensar em demasia, o que torna difícil saciar a necessidade de confirmar se o amor é verdadeiro ou se irá durar.

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
Desta forma as zonas mais escuras recembem carateres menos densos e as zonas mais claras recebem carateres mais densos. O expoente '1.4' ajusta a distribuição tonal da composição.

* interação com o rato 

Ao clicar e arrastar, os caracteres mais próximos do rato recebem uma força de afastamento: 

```js
const force =
  (1 - distance / PUSH_RADIUS) * PUSH_FORCE / scale;

cell.vx += (dx / distance) * force;
cell.vy += (dy / distance) * force;
```

Quanto mais próximo estiver um carácter do rato, maior é a força
aplicada. `PUSH_RADIUS` define o alcance da interação e `PUSH_FORCE`
define a sua intensidade.

### Retorno elástico

Depois de serem afastados, os caracteres regressam às posições
originais através de um movimento de mola com amortecimento:

```js
cell.vx = (cell.vx - cell.dx * SPRING) * DAMPING;
cell.vy = (cell.vy - cell.dy * SPRING) * DAMPING;

cell.dx += cell.vx;
cell.dy += cell.vy;
```

`dx` e `dy` representam o deslocamento de cada carácter; `vx` e
`vy` representam a sua velocidade. `SPRING` controla a força de
retorno e `DAMPING` reduz progressivamente o movimento, até a
composição estabilizar.

### Recursos

Ao longo deste projeto utilizei cerca de 4 ferramentas:

* O p5.js web editor para conseguir testar o código em tempo real através da opção auto-refresh 

* Recursos do youtube, em específico dois vídeos da criadora Patt Vira: 


**p5.js Coding Tutorial | Interactive Floating Typography**

https://www.youtube.com/watch?v=-6v_AYyn49k

**p5.js Coding Tutorial | ASCII Text Images and Videos!**

https://www.youtube.com/watch?v=4IyeLc6J1Uo&t=51s

* A ferramenta de AI perplexity, que me ajudou a retificar o código inicial e a organizar os pontos mais importantes de se alterar no código.

* A ferramenta de IA Copilot, integrada no Visual Studio Code, ajudou-me, através da experimentação com comandos, a chegar ao resultado final, fornecendo explicações detalhadas sobre cada alteração.

