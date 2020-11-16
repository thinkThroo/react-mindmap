import { ThemeType } from '@blink-mind/core';

export const theme1: ThemeType = {
  name: 'theme1',
  randomColor: false,
  background: 'rgb(250,245,205)',
  highlightColor: '#50C9CE',
  marginH: 50,
  marginV: 30,

  contentStyle: {
    lineHeight: '1.5'
  },

  linkStyle: {
    lineRadius: 5
  },
  rootTopic: {
    contentStyle: {
      background: 'rgb(221, 170, 68)',
      color: '#fff',
      fontSize: '34px',
      borderRadius: '5px',
      padding: '16px 18px 16px 18px'
    },
    subLinkStyle: {
      lineType: 'curve',
      lineWidth: '2px',
      lineColor: 'rgb(221, 170, 68)'
    }
  },
  primaryTopic: {
    contentStyle: {
      background: '#e8eaec',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'rgb(221, 170, 68)',
      borderRadius: '5px',
      fontSize: '17px',
      padding: '10px 15px 10px 15px'
    },
    subLinkStyle: {
      lineType: 'curve',
      lineWidth: '2px',
      lineColor: 'rgb(221, 170, 68)'
    }
  },

  normalTopic: {
    contentStyle: {
      background: '#fff',
      border: '1px solid #e8eaec',
      borderRadius: '20px',
      color: 'rgb(187, 136, 34)',
      fontSize: '13px',
      padding: '4px 10px'
    },
    subLinkStyle: {
      lineType: 'round',
      lineRadius: 5,
      lineWidth: '1px',
      lineColor: 'rgb(187, 136, 34)'
    }
  }
};
