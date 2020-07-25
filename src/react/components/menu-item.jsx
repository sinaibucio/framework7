import React, { forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { classNames, getDataAttrs, getSlots, emit } from '../utils/utils';
import {
  colorClasses,
  linkRouterAttrs,
  linkRouterClasses,
  linkActionsClasses,
  linkActionsAttrs,
} from '../utils/mixins';
import { useRouteProps } from '../utils/use-route-props';
import { useIcon } from '../utils/use-icon';
import { f7ready, f7 } from '../utils/f7';

/* dts-props
  id?: string | number;
  className?: string;
  style?: React.CSSProperties;
  COLOR_PROPS
  LINK_ICON_PROPS
  LINK_ROUTER_PROPS
  LINK_ACTIONS_PROPS
*/

const MenuItem = forwardRef((props, ref) => {
  const { className, id, style, link, href, target, text, dropdown, iconOnly } = props;
  const dataAttrs = getDataAttrs(props);

  const elRef = useRef(null);

  const onClick = (e) => {
    emit(props, 'click', e);
  };
  const onOpened = (el) => {
    if (elRef.current !== el) return;
    emit(props, 'menuOpened', el);
  };
  const onClosed = (el) => {
    if (elRef.current !== el) return;
    emit(props, 'menuClosed', el);
  };

  useImperativeHandle(ref, () => ({
    el: elRef.current,
  }));

  useRouteProps(elRef, props);

  const onMount = () => {
    f7ready(() => {
      f7.on('menuOpened', onOpened);
      f7.on('menuClosed', onClosed);
    });
  };

  const onDestroy = () => {
    f7.off('menuOpened', onOpened);
    f7.off('menuClosed', onOpened);
  };

  useEffect(() => {
    onMount();
    return onDestroy;
  }, []);

  const iconEl = useIcon(props);
  const slots = getSlots(props);

  let iconOnlyComputed;

  if (iconOnly || (!text && slots.text && slots.text.length === 0) || (!text && !slots.text)) {
    iconOnlyComputed = true;
  } else {
    iconOnlyComputed = false;
  }

  const isLink = link || href || href === '';
  const Tag = isLink ? 'a' : 'div';
  const isDropdown = dropdown || dropdown === '';

  const classes = classNames(
    {
      'menu-item': true,
      'menu-item-dropdown': isDropdown,
      'icon-only': iconOnlyComputed,
    },
    className,
    colorClasses(props),
    linkRouterClasses(props),
    linkActionsClasses(props),
  );

  let hrefComputed = href;
  if (typeof hrefComputed === 'undefined' && link) hrefComputed = '#';

  const attrs = {
    href: hrefComputed,
    target,
    ...linkRouterAttrs(props),
    ...linkActionsAttrs(props),
  };

  return (
    <Tag
      ref={elRef}
      className={classes}
      id={id}
      style={style}
      {...attrs}
      {...dataAttrs}
      onClick={onClick}
    >
      {(text || (slots.text && slots.text.length) || iconEl) && (
        <div className="menu-item-content">
          {text}
          {iconEl}
          {slots.text}
        </div>
      )}
      {slots.default}
    </Tag>
  );
});

MenuItem.displayName = 'f7-menu-item';

export default MenuItem;