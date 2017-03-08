import React from 'react';
import { assert } from 'sjtest';
import Login from 'hooru';
import {Modal} from 'react-bootstrap';
import { XId, uid } from 'wwutils';
import Cookies from 'js-cookie';
import DataStore from '../../plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';
import Misc from '../Misc';
import C from '../../C';
/**
	TODO:
	- doEmailLogin(email, password) and doSocialLogin(service) are available as props now
	- Use them in the appropriate section of the form
*/


const SocialSignin = ({verb, socialLogin}) => {
	return (
		<div className="social-signin">
			<div className="form-group">
				<button onClick={() => ActionMan.socialLogin('twitter')} className="btn btn-default form-control">
					<Misc.Logo size='small' service='twitter' /> { verb } with Twitter
				</button>
			</div>
			<div className="form-group">
				<button onClick={() => ActionMan.socialLogin('facebook')} className="btn btn-default form-control">
					<Misc.Logo size="small" service="facebook" /> { verb } with Facebook
				</button>
			</div>
			<div className="form-group hidden">
				<button onClick={() => ActionMan.socialLogin('instagram')} className="btn btn-default form-control">
					<Misc.Logo size='small' service='instagram' /> { verb } with Instagram
				</button>
			</div>
			<p><small>Good-Loop will never share your data, and will never post to  social media without your consent.
				You can read our <a href='https://good-loop.com/privacy-policy.html' target="_new">privacy policy</a> for more information.
			</small></p>
		</div>
	);
};


const EmailSignin = ({ verb, person, password, doItFn, handleChange}) => {
	const passwordField = verb === 'reset' ? ('') : (
		<div className="form-group">
			<label htmlFor="password">Password</label>
			<input
				id="password_input"
				className="form-control"
				type="password"
				name="password"
				placeholder="Password"
				value={password}
				onChange={(event) => handleChange('password', event.target.value)}
			/>
		</div>
	);

	const buttonText = {
		login: 'Log in',
		register: 'Register',
		reset: 'Reset password',
	}[verb];

	// login/register
	return (
		<form
			id="loginByEmail"
			onSubmit={(event) => {
				event.preventDefault();
				doItFn();
			}}
		>
			<div className="form-group">
				<label htmlFor="person">Email</label>
				<input
					id="person_input"
					className="form-control"
					type="email"
					name="person"
					placeholder="Email"
					value={person}
					onChange={(event) => handleChange('person', event.target.value)}
				/>
			</div>
			{ passwordField }
			<div className="form-group">
				<button type="submit" className="btn btn-default form-control" >
					{ buttonText }
				</button>
			</div>
			<LoginError />
			{ /* <ResetLink verb={verb} setVerbReset={() => handleChange('verb', 'reset')} /> */}
		</form>
	);
}; // ./EmailSignin

const ResetLink = ({verb, setVerbReset}) => {
	if (verb === 'login') {
		return (
			<div className='pull-right'>
				<small>
					<a onClick={setVerbReset}>Forgotten password?</a>
				</small>
			</div>
		);
	}
	return null;
};

const LoginError = function() {
	if ( ! Login.error) return <div />;
	return (
		<div className="form-group">
			<div className="alert alert-danger">{ Login.error.text }</div>
		</div>
	);
};


/**
		Login or Signup (one widget)
		See SigninScriptlet

*/
const LoginWidget = ({showDialog}) => {
	let verb = DataStore.appstate.widget && DataStore.appstate.widget.LoginWidget && DataStore.appstate.widget.LoginWidget.verb;
	if ( ! verb) verb = 'login';
	
	const heading = {
		login: 'Log In',
		register: 'Register',
		reset: 'Reset Password'
	}[verb];

	const doItFn = {
		login: doEmailLogin,
		register: doEmailRegister,
		reset: null,
	}[verb];

	return (
		<Modal show={showDialog} className="login-modal" onHide={() => DataStore.setShow(C.show.LoginWidget, false)}>
			<Modal.Header>
				<Modal.Title>
					<Misc.Logo service="goodloop" size='large' transparent={false} />
					Welcome (back) to the Good-Loop Portal
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="container">
				<div className="row">
					<div className="col-sm-6 col-center">
						<EmailSignin
							verb={verb}
							person={person}
							password={password}
							handleChange={handleChange}
							doItFn={() => doItFn(person, password)}
						/>
						<div className="col-sm-6">
							<SocialSignin verb={verb} services={null} />
						</div>
					</div>
				</div>
				</div>
			</Modal.Body>
			<Modal.Footer>
			{
				verb === 'register' ?
					<div>
						Already have an account?
						&nbsp;<a href='#' onClick={() => handleChange('verb', 'login')}>Login</a>
					</div> :
					<div>
						Don&#39;t yet have an account?
						&nbsp;<a href='#' onClick={() => handleChange('verb', 'register')}>Register</a>
					</div>
			}
			</Modal.Footer>
		</Modal>
	);
}; // ./LoginWidget


export default LoginWidget;
