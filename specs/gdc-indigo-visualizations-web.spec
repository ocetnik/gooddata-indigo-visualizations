%global gdc_prefix /var/www/doc

Name: gooddata-indigo-visualizations-web
Version: 3.%{gdcversion}
Release: 1%{dist}
Summary: GDC Indigo Visualizations Web

Group: Applications/Productivity
License: Proprietary
URL: https://github.com/gooddata/gooddata-indigo-visualizations
Source0: %{name}.tar.gz
BuildArch: noarch

BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)

BuildRequires:  nodejs > 1:6.0, nodejs < 1:7.0, npm > 3.10, git, yarn = 0.22.0

%description
%{summary}

%prep
%setup -q -n %{name} -c

%build
export PATH="$PATH:$PWD/node_modules/.bin/"
node --version
npm --version
git clone -b develop --single-branch --depth 1 ssh://git@github.com/gooddata/gdc-ci.git gdc-ci
export WORKSPACE=`pwd`
export CLIENT_PATH=$WORKSPACE
pushd gdc-ci/components/client/cl-builder/
yarn install --pure-lockfile
popd

node gdc-ci/components/client/cl-builder/cl-builder.js -p rpm-build

%install
rm -rf $RPM_BUILD_ROOT

mkdir -p $RPM_BUILD_ROOT%{gdc_prefix}/indigo-visualizations
cp -a dist-storybook/* $RPM_BUILD_ROOT%{gdc_prefix}/indigo-visualizations/

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(0644,root,root,0755)
%dir %{gdc_prefix}/indigo-visualizations
%{gdc_prefix}/indigo-visualizations/*

%changelog
