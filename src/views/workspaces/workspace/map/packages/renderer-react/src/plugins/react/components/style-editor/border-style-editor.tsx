import * as React from 'react';
import {
  renderItem,
  SettingGroup,
  SettingItemColorPicker,
  SettingItemSelect,
  SettingTitle
} from '../right-top-panel';
import { ContentStyleEditorProps } from './types';

const borderWidthItems = [...Array(7).keys()];
const borderRadiusItems = [0, 5, 10, 15, 20, 25, 30, 35];
const borderStyleItems = ['none', 'solid', 'dotted', 'dashed', 'double'];

export function BorderStyleEditor(props: ContentStyleEditorProps) {
  const { contentStyle, setContentStyle } = props;
  const handleBorderWidthChange = value => {
    // log('handleBorderWithChange:', value);
    setContentStyle({ borderWidth: `${value}px` });
  };

  const handleBorderStyleChange = value => {
    setContentStyle({ borderStyle: value });
  };

  const handleBorderRadiusChange = value => {
    // log('handleBorderRadiusChange:', value);
    setContentStyle({ borderRadius: `${value}px` });
  };

  const handleBorderColorChange = color => {
    setContentStyle({ borderColor: color });
  };

  return (
    <SettingGroup>
      <SettingTitle>Border</SettingTitle>
      <div>
        <SettingItemSelect
          text={`width: ${
            contentStyle.borderWidth ? contentStyle.borderWidth : '0px'
          }`}
          items={borderWidthItems}
          itemRenderer={renderItem('px')}
          onItemSelect={handleBorderWidthChange}
        />
        <SettingItemSelect
          text={`style: ${
            contentStyle.borderStyle ? contentStyle.borderStyle : 'none'
          }`}
          items={borderStyleItems}
          itemRenderer={renderItem('')}
          onItemSelect={handleBorderStyleChange}
        />
        <SettingItemSelect
          text={`radius: ${contentStyle.borderRadius}`}
          items={borderRadiusItems}
          itemRenderer={renderItem('px')}
          onItemSelect={handleBorderRadiusChange}
        />
        <SettingItemColorPicker
          color={contentStyle.borderColor}
          handleColorChange={handleBorderColorChange}
        />
      </div>
    </SettingGroup>
  );
}
