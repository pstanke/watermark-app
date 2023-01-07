const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async (inputFile, outputFile, text) => {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const textData = {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());

    await image.quality(100).writeAsync(outputFile);
  } catch (error) {
    console.log('Something went wrong... Try again!');
  }
};

const addImageWatermarkToImage = async (
  inputFile,
  outputFile,
  watermarkFile
) => {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });

    await image.quality(100).writeAsync(outputFile);
  } catch (error) {
    console.log('Something went wrong... Try again!');
  }
};

const editImage = async (inputFile, options) => {
  try {
    const image = await Jimp.read(inputFile);

    if (options.includes('make image brighter')) {
      image.brightness(0.2);
    }

    if (options.includes('increase contrast')) {
      image.contrast(0.2);
    }

    if (options.includes('make image b&w')) {
      image.grayscale();
    }

    if (options.includes('invert image')) {
      image.invert();
    }

    await image.quality(100).writeAsync(inputFile);
  } catch (error) {
    console.log('Something went wrong... Try again!');
  }
};

const prepareOutputFilename = (filename) => {
  const [name, ext] = filename.split('.');

  return `${name}-with-watermark.${ext}`;
};

const startApp = async () => {
  console.log('App is loading...');

  // Ask if user is ready
  const answer = await inquirer.prompt([
    {
      name: 'start',
      message:
        'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm',
    },
  ]);

  // if answer is no, just quit the app
  if (!answer.start) process.exit();

  // ask about input file and watermark type and edition
  const options = await inquirer.prompt([
    {
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpg',
    },
    {
      name: 'watermarkType',
      message: 'Select watermark type?',
      type: 'list',
      choices: ['Text watermark', 'Image watermark'],
    },
    {
      name: 'editImage',
      message: 'Do you want edit your image?',
      type: 'confirm',
    },
  ]);

  if (options.editImage) {
    const editor = await inquirer.prompt([
      {
        name: 'optionType',
        type: 'checkbox',
        choices: [
          'make image brighter',
          'increase contrast',
          'make image b&w',
          'invert image',
          'do nothing',
        ],
      },
    ]);

    if (fs.existsSync('./img/' + options.inputImage)) {
      editImage('./img/' + options.inputImage, editor.optionType);
      console.log('Your image has been edited!');
    } else {
      console.log('Something went wrong... Try again');
    }
  }

  if (options.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([
      {
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:',
      },
    ]);

    options.watermarkText = text.value;

    if (fs.existsSync('./img/' + options.inputImage)) {
      addTextWatermarkToImage(
        './img/' + options.inputImage,
        './img/' + prepareOutputFilename(options.inputImage),
        options.watermarkText
      );

      console.log('Your watermark has been added!');
    } else {
      console.log('Something went wrong... Try again');
    }
  } else {
    const image = await inquirer.prompt([
      {
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name:',
        default: 'logo.png',
      },
    ]);

    options.watermarkImage = image.filename;

    if (
      fs.existsSync(
        './img/' + options.inputImage && './img/' + options.watermarkImage
      )
    ) {
      addImageWatermarkToImage(
        './img/' + options.inputImage,
        './img/' + prepareOutputFilename(options.inputImage),
        './img/' + options.watermarkImage
      );
      console.log('Your watermark has been added!');
    } else {
      console.log('Something went wrong... Try again');
    }
  }
};

startApp();
