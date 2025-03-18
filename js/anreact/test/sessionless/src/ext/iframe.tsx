/**
 * Credits to https://github.com/robbestad/react-iframe , under ISC license.
 * 
 * Modified by Ody Z.
 */
import React, { ComponentType } from "react"
import objectAssign from "object-assign"

type SandboxAttributeValue = "allow-downloads-without-user-activation" | "allow-forms" | "allow-modals" | "allow-orientation-lock" | "allow-pointer-lock" | "allow-popups" | "allow-popups-to-escape-sandbox" | "allow-presentation" | "allow-same-origin" | "allow-scripts" | "allow-storage-access-by-user-activation" | "allow-top-navigation" | "allow-top-navigation-by-user-activation";

export interface IIframe {
	head: ComponentType,
	url: string,
	src?: string,
	allowFullScreen?: boolean,
	position?: "relative" | "absolute" | "fixed" | "sticky" | "static" | "inherit" | "initial" | "unset",
	display?: "block" | "none" | "inline" | "initial",
	height?: string,
	width?: string,
	loading?: "auto" | "eager" | "lazy",
	target?: string,
	importance?: "auto" | "high" | "low",
	overflow?: string,
	styles?: object,
	name?: string,
	allowpaymentrequest?: boolean,
	referrerpolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url",
	onLoad?: () => void,
	onMouseOver?: () => void,
	onMouseOut?: () => void,
	frameBorder?: number,
	scrolling?: "auto" | "yes" | "no",
	id?: string,
	ariaHidden?: boolean,
	ariaLabel?: string,
	ariaLabelledby?: string,
	sandbox?: SandboxAttributeValue | SandboxAttributeValue[],
	allow?: string,
	className?: string,
  title?: string,
  key?: string
}

const Iframe: ComponentType<IIframe> = ({
	head,
	url,
	allowFullScreen,
	position,
	display,
	height,
	width,
	overflow,
	styles,
	onLoad,
	onMouseOver,
	onMouseOut,
	scrolling,
	id,
	frameBorder,
	ariaHidden,
	sandbox,
	allow,
	className,
	title,
	ariaLabel,
	ariaLabelledby,
	name,
	target,
	loading,
	importance,
	referrerpolicy,
	allowpaymentrequest,
	src,
	key
}: IIframe) => {
	const defaultProps = objectAssign({
		src: src || url,
		target: target || null,
		style: {
			position: position || null,
			display: display || "initial",
			overflow: overflow || null
		},
		scrolling: scrolling || null,
		allowpaymentrequest: allowpaymentrequest || null,
		importance: importance || null,
		sandbox: (Array.isArray(sandbox) ? sandbox.join(" ") : sandbox) || null,
		loading: loading || null,
		styles: styles || null,
		name: name || null,
		className: className || null,
		allowFullScreen: allowFullScreen || null,
		referrerpolicy: referrerpolicy || null,
		title: title || null,
		allow: allow || null,
		id: id || null,
		"aria-labelledby": ariaLabelledby || null,
		"aria-hidden": ariaHidden || null,
		"aria-label": ariaLabel || null,
		width: width || null,
		height: height || null,
		onLoad: onLoad || null,
		onMouseOver: onMouseOver || null,
		onMouseOut: onMouseOut || null,
		key: key || "iframe"
	})
	let props = Object.create(null)
	for (let prop of Object.keys(defaultProps)) {
		if (defaultProps[prop] != null) {
			props[prop] = defaultProps[prop]
		}
	}

	for (let i of Object.keys(props.style)) {
		if (props.style[i] == null) {
			delete props.style[i]
		}
	}

	if (props.styles) {
		for (let key of Object.keys(props.styles)) {
			if (props.styles.hasOwnProperty(key)) {
				props.style[key] = props.styles[key]
			}
			if (Object.keys(props.styles).pop() == key) {
				delete props.styles
			}
		}
	}

	if (allowFullScreen) {
		if ("allow" in props) {
			const currentAllow = props.allow.replace("fullscreen", "")
			props.allow = `fullscreen ${currentAllow.trim()}`.trim()
		} else {
			props.allow = "fullscreen"
		}
	}

	if (frameBorder >= 0) {
		if (!props.style.hasOwnProperty("border")) {
			props.style.border = frameBorder
		}
	}

	// props.onLoad=(e) => {
	// 	document.body.appendChild(props.closing)
	// };

	return <iframe {...props} />
}

export default Iframe
